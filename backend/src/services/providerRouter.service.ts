import { ChatChunk } from "../types/types";
import { nvidiaChat } from "@services/nvidia.service";
import { IModel } from "@modules/model/model.model"
import { anthropicChat } from "@services/anthropic.service";
import { googleChat } from "@services/google.service";
import { groqChat } from "@services/groq.service";
import { openaiChat } from "./openai.service";
import { AppError } from "../types/errors";


interface RouteOptions {
    model: IModel;
    messages: {
        role: string,
        content: string
    }[],
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}
    

export async function* routeToProvider(options: RouteOptions): AsyncGenerator<ChatChunk> {
    const providerSlug: string = (options.model.provider as any).slug.toLowerCase();

    switch(providerSlug){
        case "anthropic":
            yield* anthropicChat(options);
            break;
        case "google":
            yield* googleChat(options);
            break;
        case "groq":
            yield* groqChat(options);
            break;
        case "nvidia":            
            yield* nvidiaChat(options);
            break;
        case "openai":            
            yield* openaiChat(options);
            break;
        default:
            throw new AppError(`'${providerSlug}' is not supported yet`, 400, "NOT_SUPPORTED", "Please choose a different model");
    }
}