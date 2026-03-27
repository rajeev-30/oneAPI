import mongoose, { model, Types, Document } from "mongoose";

export interface IWallet extends Document {
    user: Types.ObjectId;
    balance: number;
    totalSpent: number;
}

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // one wallet per user
        },
        balance: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0,
        }
    },
    { timestamps: true }
);

export default model<IWallet>("Wallet", walletSchema);