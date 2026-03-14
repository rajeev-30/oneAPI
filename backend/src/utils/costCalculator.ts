import { IModel } from "@modules/model/model.model";


export const costCalculator = (promptTokens: number, completionTokens: number, model: IModel) => {
    const inputCostPer1KTokens = Number((model?.billing as any)?.inputCostPer1KTokens ?? 0);
    const outputCostPer1KTokens = Number((model?.billing as any)?.outputCostPer1KTokens ?? 0);

    const inputCost = (promptTokens / 1000) * inputCostPer1KTokens;
    const outputCost = (completionTokens / 1000) * outputCostPer1KTokens;

    return inputCost + outputCost;
    
}