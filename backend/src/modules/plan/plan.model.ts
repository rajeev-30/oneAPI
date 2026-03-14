import { Schema, Document, model } from "mongoose";

type PlanType = "fixed" | "payg";

interface IPlan extends Document {
    name:        string;   // "Free" | "Pro" | "Enterprise"
    price:       number;   // per month in USD
    type:        PlanType;
    limits: {
        requestsPerMonth: number;
        tokensPerMonth:   number;
        requestsPerMinute: number;
        tokensPerMinute:   number;
    };
    features: string[];    // ["Stream", "All Models", "Priority Support"]
}

const planSchema = new Schema<IPlan>({
    name:  { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    type:  { type: String, required: true },
    limits: {
        requestsPerMonth:  { type: Number, default: 100   },
        tokensPerMonth:    { type: Number, default: 10000 },
        requestsPerMinute: { type: Number, default: 10    },
        tokensPerMinute:   { type: Number, default: 1000  },
    },
    features: [String]
}, { timestamps: true });

export default model<IPlan>("Plan", planSchema);