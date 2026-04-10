import { chatCompletionSchema } from "./gateway.validation";
import { AppError } from "../../types/errors";
import Model from "@modules/model/model.model";


export const chatCompletionValidation = (body: unknown) => {
    const result = chatCompletionSchema.safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }
    return result.data;
};

export const getModel = async (modelSlug: string) => {
    const model = await Model.findOne({ slug: modelSlug })
        .populate("provider")
        .populate("billing");

    if(!model){
        throw new AppError('We currently do not support the requested model', 400, "NOT_SUPPORTED", "Please choose a different model");
    }

    return model;
};



