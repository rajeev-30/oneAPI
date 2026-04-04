import "express";
import { ISubscription } from "@modules/subscription/subscription.model";

declare module "express" {
    interface Request {
        userId?:       string;  
        apiKey?:       string;
        apiKeyId?:     string;
        subscription?: ISubscription; 
        billingSource?: "plan" | "wallet"; 
    }
}