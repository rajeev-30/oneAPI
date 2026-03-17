import "express";
import { IApiKey }       from "@modules/apiKey/apiKey.model";
import { ISubscription } from "@modules/subscription/subscription.model";

declare module "express" {
    interface Request {
        userId?:       string;  // ✅ module augmentation (more reliable than global)
        apiKeyId?:     string;
        apiKey?:       string;
        tpmRedisKey?:  string;
        subscription?: ISubscription; // ✅ add this
    }
}