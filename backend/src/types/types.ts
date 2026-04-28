
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

type paginationInfo = {
    current_page: number;
    per_page: number;
    total_items: number;
    last_page: number;
};

export type ApiResponse<T = unknown> = {
    success: boolean;
    message: string;
    pagination?: paginationInfo;
    data?: T | null;
    error?: unknown;
};
