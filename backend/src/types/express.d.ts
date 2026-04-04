import "express";
import { ISubscription } from "@modules/subscription/subscription.model";

declare module "express" {
    interface Request {
        userId?:       string;  
        apiKey?:       string;
        subscription?: ISubscription; 
        billingSource?: "plan" | "wallet"; 
    }
}