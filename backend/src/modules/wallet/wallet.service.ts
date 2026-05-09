import Wallet from "./wallet.model";
import Subscription from "@modules/subscription/subscription.model";
import { walletSchema } from "./wallet.validation";
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";
import { getSubscriptionCacheKey } from "@modules/subscription/subscription.services";

const getWalletCacheKey = (userId: string): string => `wallet:${userId}`;

export const addBalanceService = async (userId: string, body: unknown) => {
    const redis = getRedisClient();
    const walletCacheKey = getWalletCacheKey(userId);
    const subscriptionCacheKey = getSubscriptionCacheKey(userId);

    const result = walletSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { balance } = result.data;

    //Will remove this once the payment method is implemented
    const currentBalance = await Wallet.findOne({ user: userId }).select("balance");
    if (currentBalance && currentBalance.balance > 100) {
        throw new AppError("You cannot add more than 100 to your wallet.", 400, "LIMIT_EXCEEDED", "Currently we only allow a maximum balance of 100, Until we have a payment system in place.");
    }

    const wallet = await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { balance } },
        { upsert: true, setDefaultsOnInsert: true, returnDocument: "after" }
    );

    await Subscription.findOneAndUpdate(
        { user: userId },
        { $set: { wallet: wallet._id, status: "active" } },
        { upsert: true, setDefaultsOnInsert: true }
    );

    await redis.set(walletCacheKey, JSON.stringify(wallet));
    await redis.del(subscriptionCacheKey);
    return wallet;
};


export const getWalletService = async (userId: string) => {
    const redis = getRedisClient();
    const cacheKey = getWalletCacheKey(userId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
        throw new AppError("Wallet not found", 404, "NOT_FOUND", "Please provide a valid wallet ID.");
    }

    await redis.set(cacheKey, JSON.stringify(wallet));
    return wallet;
};

export const updateWallet = async (
    userId: string,
    billingSource: "plan" | "wallet" | undefined,
    cost: number
) => {
    const redis = getRedisClient();
    const cacheKey = getWalletCacheKey(userId);

    if (billingSource === "wallet") {
        const wallet = await Wallet.findOneAndUpdate(
            { user: userId },
            [
                {
                    $set: {
                        totalSpent: {
                            $add: [
                                "$totalSpent",
                                { $min: ["$balance", cost] }
                            ]
                        },
                        balance: {
                            $max: [
                                { $subtract: ["$balance", cost] },
                                0
                            ]
                        }
                    }
                }
            ],
            { returnDocument: "after" }
        );
        await redis.set(cacheKey, JSON.stringify(wallet));
        return wallet;
    }
};