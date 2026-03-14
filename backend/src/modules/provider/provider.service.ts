import { IModel } from "@modules/model/model.model"
import { anthropicChat } from "@services/anthropic.service";
import { googleChat } from "@services/google.service";
import { groqChat } from "@services/groq.service";
import { ChatChunk } from "../../types/types";


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
    const providerSlug = (options.model.provider as any).slug;

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
        default:
            throw new Error(`'${providerSlug}' is not supported yet`);
    }
}
