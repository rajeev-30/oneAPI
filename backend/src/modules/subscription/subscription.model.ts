import { Schema, Document, model, Types } from "mongoose";


export interface ISubscription extends Document {
    user:      Types.ObjectId;
    plan:      Types.ObjectId;
    wallet:    Types.ObjectId;
    status:    "active" | "expired";
    startDate: Date;
    endDate:   Date;          // next billing date
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
        default: null
    },
    wallet: { 
        type: Schema.Types.ObjectId, 
        ref: "Wallet" ,
        default: null
    },
    
    status: { 
        type: String, 
        enum: ["active", "expired"],
        default: "active"
    },
    startDate: { type: Date, default: null },
    endDate:   { type: Date, default: null },   // 30 days from start
}, { timestamps: true });

export default model<ISubscription>("Subscription", subscriptionSchema);