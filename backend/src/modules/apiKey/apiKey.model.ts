import { baseSchemaFields } from "@utils/base.model";
import {Schema, Document, model, Types} from "mongoose";

export interface IApiKey extends Document {
  name: string;
  user: Types.ObjectId;
  key: string;
  totalSpent: number;
  totalRequests: number,
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  totalTokensUsed: number;
  lastUsedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  name: { 
    type: String, 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  rateLimit: {
    requestsPerMinute: { type: Number, default: 100 },
    tokensPerMinute: { type: Number, default: 1000 }
  },
  totalTokensUsed: {
    type: Number,
    default:0
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  totalRequests: {
    type: Number, 
    default: 0 
  },
  lastUsedAt: { 
    type: Date,
    default: null
  },
  ...baseSchemaFields
}, { timestamps: true });

export default model<IApiKey>("ApiKey", apiKeySchema);
