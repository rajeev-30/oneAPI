import { Schema, Document, model } from "mongoose";


interface IPlan extends Document {
    name:        string;   // "Free" | "Pro" | "Enterprise"
    price:       number;   // per month in INR
    limits: {
        requestsPerDay: number;
        tokensPerDay:   number;
        requestsPerMinute: number;
        tokensPerMinute:   number;
    };
    features: string[];    // ["Stream", "All Models", "Priority Support"]
}

const planSchema = new Schema<IPlan>({
    name:  { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    
    limits: {
        requestsPerDay:  { type: Number, default: 20   },
        tokensPerDay:    { type: Number, default: 10000 },
        requestsPerMinute: { type: Number, default: 5    },
        tokensPerMinute:   { type: Number, default: 1000  },
    },
    features: [String]
}, { timestamps: true });

export default model<IPlan>("Plan", planSchema);