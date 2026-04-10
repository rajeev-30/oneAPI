import { model, Types, Schema, Document } from "mongoose";
import { request } from "node:http";

interface IUsage extends Document {
  user: Types.ObjectId;
  month: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  modelBreakdown: Array<{
    model: Types.ObjectId;
    tokens: number;
    requests: number;
    cost: number;
  }>;
}

const usageSchema = new Schema<IUsage>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    index: true 
  },

  month: String, // "2026-03"

  totalRequests: {
    type: Number,
    default: 0,
  },
  totalTokens: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },

  modelBreakdown: [
    {
      model: { 
        type: Schema.Types.ObjectId, 
        ref: "Model" 
      },
      requests: { 
        type: Number, 
        default: 0 
      },
      tokens: { 
        type: Number, 
        default: 0 
      },
      cost: { 
        type: Number, 
        default: 0 
      }
    }
  ],
}, {timestamps: true});

export default model("Usage", usageSchema);