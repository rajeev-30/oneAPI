import { baseSchemaFields } from "@utils/base.model";
import {Schema, Document, model} from "mongoose";

export interface IProvider extends Document {
  name: string;
  slug: string;
}

const providerSchema = new Schema<IProvider>({
  name: {
    type: String,
    required: true
  },
  slug: { 
    type: String, 
    unique: true,
    required: true 
  },
  ...baseSchemaFields
}, { timestamps: true });

export default model<IProvider>("Provider", providerSchema);
