import { Schema, Document, model } from "mongoose";
import { required } from "zod/v4/core/util.cjs";

export interface IPlan extends Document {
    name: string;
    price: number;
    limits: {
        requestsPerDay: number;
        tokensPerDay: number;
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
    features: string[];
}

const planSchema = new Schema<IPlan>(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
        price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        limits: {
            requestsPerDay: { type: Number, required: true },
            tokensPerDay: { type: Number, required: true },
            requestsPerMinute: { type: Number, required: true },
            tokensPerMinute: { type: Number, required: true },
        },
        features: [String],
    },
    { timestamps: true }
);

export default model<IPlan>("Plan", planSchema);