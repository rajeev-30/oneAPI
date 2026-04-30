import { Schema, Types, model } from "mongoose";


interface IConversation {
    user: Types.ObjectId;
    title: string;
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
}

const conversationSchema = new Schema<IConversation>({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    title: {
        type: String,
        required: true
    },
    messages: [
        {
            role: { 
                type: String, 
                enum: ["user", "assistant"], 
                required: true 
            },
            content: { 
                type: String, 
                required: true 
            },
        },
    ],
});

export default model<IConversation>("Conversation", conversationSchema);
