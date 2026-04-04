import cron from "node-cron";
import Subscription from "@modules/subscription/subscription.model";

// Helper to add days to a date
const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

// Start the subscription expiry cron job
export const startSubscriptionExpiryCron = () => {
    cron.schedule(
        "0 0 * * *", // Runs daily at 00:00 UTC
        async () => {
            try {
                const now = new Date();

                // Find active subscriptions whose endDate has passed
                const dueSubscriptions = await Subscription.find({
                    status: "active",
                    endDate: { $ne: null, $lte: now }
                })
                    .populate("plan")
                    .populate("wallet");

                for (const subscription of dueSubscriptions) {
                    const plan = subscription.plan as any;
                    const wallet = subscription.wallet as any;

                    const planName = String(plan?.name ?? "").toLowerCase();
                    const walletBalance = Number(wallet?.balance ?? 0);

                    // Rule 1: Free plan never expires → extend by 30 days
                    if (planName === "free") {
                        const baseEndDate = subscription.endDate ?? now;
                        subscription.endDate = addDays(baseEndDate, 30);
                        subscription.status = "active";
                        await subscription.save();
                        continue;
                    }

                    // Rule 2: Wallet has balance → keep active, clear plan window
                    if (walletBalance > 0) {
                        subscription.plan = null;
                        subscription.startDate = null;
                        subscription.endDate = null;
                        subscription.status = "active";
                        await subscription.save();
                        continue;
                    }

                    // Rule 3: Expire subscription if endDate reached and wallet balance <= 0
                    subscription.plan = null;
                    subscription.startDate = null;
                    subscription.endDate = null;
                    subscription.status = "expired";

                    await subscription.save();
                }
            } catch (error) {
                console.error("Subscription expiry cron failed:", error);
            }
        },
        { timezone: "UTC" } // Change to your timezone if needed, e.g., "Asia/Kolkata"
    );
};
