import { baseSchemaFields } from "@utils/base.model";
import {Schema, model, Document, ObjectId} from "mongoose";

export interface IModel extends Document {
    name: string;
    slug: string;
    provider: ObjectId;
    pricing: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ModelSchema = new Schema<IModel> ({
    name: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    provider: { 
        type: Schema.Types.ObjectId, 
        ref: "Provider", 
        required: true 
    },
    pricing: { 
        type: Schema.Types.ObjectId, 
        ref: "Billing", 
        required: true 
    },
    ...baseSchemaFields
}, { timestamps: true });

export default model<IModel>("Model", ModelSchema);