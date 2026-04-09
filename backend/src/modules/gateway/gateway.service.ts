import Usage from "@modules/usage/usage.model";
import { Types } from "mongoose";
import Wallet from "@modules/wallet/wallet.model";
import ApiKey from "@modules/apiKey/apiKey.model";
import { chatCompletionSchema } from "./gateway.validation";
import { AppError } from "../../types/errors";
import Model from "@modules/model/model.model";


export const chatCompletionValidation = (body: unknown) => {
    const result = chatCompletionSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }
    return result.data;
};

export const getModel = async (modelSlug: string) => {
    const model = await Model.findOne({ slug: modelSlug })
        .populate("provider")
        .populate("billing");

    if(!model){
        throw new AppError('We currently do not support the requested model', 400, "NOT_SUPPORTED", "Please choose a different model");
    }

    return model;
};

export const updateUsage = async (
    userId: string,
    modelId: Types.ObjectId,
    totalTokens: number,
    cost: number,
) => {
    const month = new Date().toISOString().slice(0, 7); // "2026-03"

    // Step 1: Try updating existing model
    const result = await Usage.updateOne(
        { user: userId, month, "modelBreakdown.model": modelId },
        {
            $inc: {
                totalRequests: 1,
                totalTokens: totalTokens,
                totalCost: cost,
                "modelBreakdown.$.tokens": totalTokens,
                "modelBreakdown.$.cost": cost,
            },
        },
    );

    // Step 2: If model not found → push new entry
    if (result.matchedCount === 0) {
        await Usage.updateOne(
            { user: userId, month },
            {
                $inc: {
                    totalRequests: 1,
                    totalTokens,
                    totalCost: cost,
                },
                $push: {
                    modelBreakdown: {
                        model: modelId,
                        tokens: totalTokens,
                        cost,
                    },
                },
            },
            { upsert: true },
        );
    }
};


export const settleBilling = async (
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


export const updateApiKeyUsage = async (
    apiKeyId: string,
    apiKey: string,
    userId: string,
    totalTokensUsed: number,
    totalSpent: number
) => {
    await ApiKey.findOneAndUpdate(
        { _id: apiKeyId, user: userId, key: apiKey },
        {
            $inc: {
                totalRequests: 1,
                totalTokensUsed,
                totalSpent
            },
            $set: {
                lastUsedAt: new Date()
            }
        },
    );
};