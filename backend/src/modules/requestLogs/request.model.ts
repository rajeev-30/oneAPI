import { baseSchemaFields } from "@utils/base.model";
import { model, Schema, Types } from "mongoose";

export interface IRequestLog  {
    user: Types.ObjectId;
    apiKey: Types.ObjectId;
    model: Types.ObjectId;
    provider: Types.ObjectId;
    requestId: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    latencyMs: number;
    status: "success" | "error";
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const requestSchema = new Schema<IRequestLog>({

  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    index: true 
  },
  apiKey: { 
    type: Schema.Types.ObjectId, 
    ref: "ApiKey", 
    index: true 
  },

  model: { 
    type: Schema.Types.ObjectId, 
    ref: "Model", 
    index: true 
  },
  provider: { 
    type: Schema.Types.ObjectId, 
    ref: "Provider" 
  },

  requestId: { 
    type: String, 
    unique: true 
  },

  promptTokens: { 
    type: Number, 
    required: true 
  },
  completionTokens: { 
    type: Number, 
    required: true 
  },
  totalTokens: { 
    type: Number, 
    required: true 
  },

  cost: { 
    type: Number, 
    required: true 
  },

  latencyMs: { 
    type: Number, 
    required: true 
  },

  status: {
    type: String,
    enum: ["success", "error"]
  },

  errorMessage: {
    type: String
  },

  ...baseSchemaFields
}, {timestamps: true})

export const RequestLog = model<IRequestLog>("RequestLog", requestSchema)
