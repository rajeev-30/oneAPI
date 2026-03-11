import { baseSchemaFields } from "@utils/base.model";
import {Schema, Document, model, ObjectId} from "mongoose";

export interface IApiKey extends Document {
  name: String;
  user: ObjectId;
  key: string;
  totalSpent: Number;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  totalTokensUsed: Number;
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
  lastUsedAt: { 
    type: Date,
    default: null
  },
  ...baseSchemaFields
}, { timestamps: true });

export default model<IApiKey>("ApiKey", apiKeySchema);
