export const getApiKeyCacheKey = (userId: string, apiKeyId: string) => `apiKey:${apiKeyId}:${userId}`;
export const getApiKeysCacheKey = (userId: string) => `apiKeys:${userId}`;
