import {Document, Schema, model} from "mongoose";

export interface IBilling extends Document{
    inputCostPer1KTokens: number;
    outputCostPer1KTokens: number;
    currency: "INR" | "USD";
}

const billingSchema = new Schema<IBilling> ({
    inputCostPer1KTokens: {
        type: Number,
        required: true
    },
    outputCostPer1KTokens: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ["INR", "USD"],
        default: "INR",
        required: true
    },
}, {timestamps: true})

export default model<IBilling>("Billing", billingSchema)