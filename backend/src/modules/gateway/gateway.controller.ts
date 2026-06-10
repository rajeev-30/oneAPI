import { Request, Response } from "express";
import { routeToProvider } from "@services/providerRouter.service";
import { recordActualUsage } from "@services/redisRateLimiter.service";
import { sendResponse } from "@utils/response";
import {chatCompletionValidation, getModel} from "./gateway.service"
import { sendErrorResponse } from "@utils/errorResponse";
import { updateUsage } from "@modules/usage/usage.service";
import { updateApiKeyUsage } from "@modules/apiKey/apiKey.service";
import { updateWallet } from "@modules/wallet/wallet.service";

export const chatCompletion = async (req: Request, res: Response) => {
    try {
        const result = chatCompletionValidation(req.body);

        const {
            model: modelSlug,
            messages,
            stream,
            temperature,
            max_tokens,
        } = result;

        const model = await getModel(modelSlug);

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

                    // final structured response
                    res.write(`data: ${JSON.stringify({
                        message: "Response generated successfully",
                        success: true,
                        data: {
                            choices: [{ message: { role: "assistant", content: null } }],
                            usage,
                            model: modelSlug,
                            done: true
                        }
                    })}\n\n`);

                    res.write("data: [DONE]\n\n");
                    res.end();
                } else {
                    // stream partial chunks in same structure
                    res.write(`data: ${JSON.stringify({
                        message: "Streaming...",
                        success: true,
                        data: {
                            choices: [{ message: { role: "assistant", content: chunk.text } }]
                        }
                    })}\n\n`);
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

            sendResponse(res, 200, {
                message: "Response generated successfully",
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
            recordActualUsage({
                userId: req.userId as string,
                actualTokens: totalTokens,
            });
        }

        if(req.billingSource === "wallet"){
            //used await here to ensure billing is settled before next request comes in, 
            //which could cause issues with concurrent requests and wallet balance updates. 
            //We can optimize this later by using a queue or background job if needed.
            await updateWallet(
                req.userId as string,
                req.billingSource as "plan" | "wallet" | undefined,
                totalCost
            );
        }
        
        updateUsage(
            req.userId as string,
            model._id,
            totalTokens,
            totalCost,
        );

        updateApiKeyUsage(
            req.apiKeyId as string,
            req.apiKey as string,
            req.userId as string,
            totalTokens,
            totalCost
        );

    } catch (error: any) {
        if (res.headersSent) {
            // Stream has already started, send error as an event and close it
            res.write(`data: ${JSON.stringify({
                success: false,
                message: "Please try again later or use different model"
            })}\n\n`);
            res.write("data: [DONE]\n\n");
            return res.end();
        }

        return sendErrorResponse(res, error, 500, "Please try again later or use different model");
    }
};


