import { chatCompletionSchema } from "./gateway.validation";
import { Request, Response } from "express";
import Model from "@modules/model/model.model";
import { routeToProvider } from "@modules/provider/provider.service";
import Subscription from "@modules/subscription/subscription.model";
import Usage from "@modules/usage/usage.model";
import { Types } from "mongoose";

export const chatCompletion = async (req: Request, res: Response) => {
    try {
        const result = chatCompletionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0].message,
                success: false
            });
        }

        const { model: modelSlug, messages, stream, temperature, max_tokens } = result.data;

        const model = await Model.findOne({ slug: modelSlug }).populate("provider");
        if (!model) {
            return res.status(404).json({
                message: "We currently do not support the requested model",
                success: false
            });
        }

        const generator = routeToProvider({ model, messages, temperature, max_tokens, stream });

        let usage: any = {}; // <-- Move usage declaration here so it's available in both branches

        if (stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            for await (const chunk of generator) {
                if (chunk.done) {
                    usage = chunk.usage; // <-- Assign usage here for streaming
                    res.write(`data: ${JSON.stringify({ usage: chunk.usage, done: true })}\n\n`);
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
                    usage
                }
            });
        }

        // update usage after getting response from provider
        // usage may be undefined if the generator never yields a done chunk
        if (usage && usage.total_tokens !== undefined && usage.totalCost !== undefined) {
            await updateUsage(req.userId as string, model._id, usage.total_tokens, usage.totalCost);
        }

    } catch (error) {
        res.status(500).json({
            message: "Error in chatCompletion gateway",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// call this after getting response from provider
const updateUsage = async (
    userId: string,
    modelId: Types.ObjectId,
    totalTokens: number,
    cost: number
) => {
    const month = new Date().toISOString().slice(0, 7); // "2026-03"

    //  update subscription usage
    await Subscription.findOneAndUpdate(
        { user: userId, status: "active" },
        {
            $inc: {
                "usage.requestsUsed": 1,
                "usage.tokensUsed": totalTokens
            }
        }
    );

    //  upsert monthly usage record
    await Usage.findOneAndUpdate(
        { user: userId, month },
        {
            $inc: {
                totalRequests: 1,
                totalTokens: totalTokens,
                totalCost: cost
            },
            // ✅ update model breakdown
            $push: {
                modelBreakdown: { model: modelId, tokens: totalTokens, cost }
            }
        },
        { upsert: true }
    );
};