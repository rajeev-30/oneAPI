import Wallet from "./wallet.model";



export const updateWallet = async (
    userId: string,
    billingSource: "plan" | "wallet" | undefined,
    cost: number
) => {
    if (billingSource === "wallet") { 
        await Wallet.findOneAndUpdate(
            { user: userId },
            [
                {
                    $set: {
                        balance: {
                            $cond: [
                                { $gte: ["$balance", cost] },
                                { $subtract: ["$balance", cost] },
                                0
                            ]
                        },
                        totalSpent: { $add: ["$totalSpent", cost] }
                    }
                }
            ],
            { updatePipeline: true }
        );
    }
};