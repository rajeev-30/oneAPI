import { chatCompletionSchema } from "./gateway.validation";
import { Request, Response } from "express";
import Model from "@modules/model/model.model";
import Usage from "@modules/usage/usage.model";
import { Types } from "mongoose";
import { routeToProvider } from "@services/providerRouter.service";
import Wallet from "@modules/wallet/wallet.model";
import { recordActualUsage } from "@services/redisRateLimiter.service";


export const chatCompletion = async (req: Request, res: Response) => {
    try {
        const result = chatCompletionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false,
            });
        }

        const {
            model: modelSlug,
            messages,
            stream,
            temperature,
            max_tokens,
        } = result.data;

        const model = await Model.findOne({ slug: modelSlug })
            .populate("provider")
            .populate("billing");
        if (!model) {
            return res.status(404).json({
                message: "We currently do not support the requested model",
                success: false,
            });
        }

        const generator = routeToProvider({
            model,
            messages,
            temperature,
            max_tokens,
            stream,
        });

        let usage: any = {}; 
        if (stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            for await (const chunk of generator) {
                if (chunk.done) {
                    usage = chunk.usage;
                    res.write(`data: ${JSON.stringify({ usage: chunk.usage, done: true })}\n\n`);
                    res.write(`data: ${JSON.stringify({ model: modelSlug })}\n\n`);
                    res.write("data: [DONE]\n\n");
                    res.end();
                } else {
                    res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
                }
            }
        } else {
            let fullText = "";

            for await (const chunk of generator) {
                if (chunk.done) {
                    usage = chunk.usage;
                } else {
                    fullText += chunk.text;
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    choices: [{ message: { role: "assistant", content: fullText } }],
                    usage,
                    model: modelSlug
                },
            });
        }

        const totalTokens = Number(usage?.total_tokens ?? 0);
        const totalCost = Number(usage?.totalCost ?? 0);


        if (req.billingSource === "plan") {
            await recordActualUsage({
                userId: req.userId as string,
                actualTokens: totalTokens,
            });
        }

        await settleBilling(
            req.userId as string,
            req.billingSource as "plan" | "wallet" | undefined,
            totalCost
        );
        
        await updateUsage(
            req.userId as string,
            model._id,
            totalTokens,
            totalCost,
        );

        return;
    } catch (error) {
        res.status(500).json({
            message: "Please try again later or use different model",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// call this after getting response from provider
const updateUsage = async (
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
                    totalTokens: totalTokens,
                    totalCost: cost,
                },
                $push: {
                    modelBreakdown: {
                        model: modelId,
                        tokens: totalTokens,
                        cost: cost,
                    },
                },
            },
            { upsert: true },
        );
    }
};



const settleBilling = async (
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
