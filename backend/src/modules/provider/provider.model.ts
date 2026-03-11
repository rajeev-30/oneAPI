import { baseSchemaFields } from "@utils/base.model";
import {Schema, Document, model} from "mongoose";

export interface IProvider extends Document {
  slug: string;
  apiKey: string;
  baseURL: string;
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<IProvider>({
  slug: { 
    type: String, 
    unique: true,
    required: true 
  },
  baseURL: { 
    type: String, 
    required: true 
  },
  apiKey: { 
    type: String, 
    required: true, 
    unique: true 
  },
  ...baseSchemaFields
}, { timestamps: true });

export default model<IProvider>("Provider", providerSchema);
