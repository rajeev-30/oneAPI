import { Schema, Document, model, Types } from "mongoose";

export interface ISubscription extends Document {
    user:      Types.ObjectId;
    plan:      Types.ObjectId;
    status:    "active" | "cancelled" | "expired";
    startDate: Date;
    endDate:   Date;          // next billing date
    usage: {
        requestsUsed: number;
        tokensUsed:   number;
    };
}

const subscriptionSchema = new Schema<ISubscription>({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    plan: { 
        type: Schema.Types.ObjectId, 
        ref: "Plan", 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["active", "cancelled", "expired"],
        default: "active"
    },
    startDate: { type: Date, default: Date.now },
    endDate:   { type: Date, required: true },   // 30 days from start
    usage: {
        requestsUsed: { type: Number, default: 0 },
        tokensUsed:   { type: Number, default: 0 }
    }
}, { timestamps: true });

export default model<ISubscription>("Subscription", subscriptionSchema);