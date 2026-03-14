
export type ChatChunk =
    | { text: string; done: false }
    | {
        done: true;
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
            totalCost?: number;
        };
      };