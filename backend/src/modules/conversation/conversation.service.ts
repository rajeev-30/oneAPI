import { conversationSchema } from "./conversation.validation";
import Conversation from "./conversation.model"
import { AppError } from "../../types/errors";
import { getRedisClient } from "@config/redis";
import { paginateQuery, paginationSchema } from "@utils/pagination";

const getConversationCacheKey = (conversationId: string, userId: string) => `conversation:${conversationId}:${userId}`;
const getConversationsCacheKey = (page: number, page_size: number | 'all', userId: string) => `conversations:${page}:${page_size}:${userId}`;
const conversationKeys: string = "conversation_keys";

export const createConversationService = async (userId: string, body: unknown) => {
    const result = conversationSchema.safeParse(body);
    const redis = getRedisClient();

    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const conversation = new Conversation({ user: userId, ...result.data });
    await conversation.save();

    const keys = await redis.smembers(conversationKeys);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    const cacheKey = getConversationCacheKey(conversation._id.toString(), userId);
    await redis.set(cacheKey, JSON.stringify(conversation));

    return conversation;
};

export const getConversationService = async (userId: string, conversationId: string) => {
    const redis = getRedisClient();
    const cacheKey = getConversationCacheKey(conversationId, userId);
    const cached = await redis.get(cacheKey);

    if (cached) {
        console.log("Cache hit for conversation:", conversationId);
        return JSON.parse(cached);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError("Conversation not found", 404, "NOT_FOUND", "Please provide a valid Conversation ID");
    }

    await redis.set(cacheKey, JSON.stringify(conversation));
    return conversation;
};

export const getConversationsTitlesService = async (userId: string, params: any) => {
    const redis = getRedisClient();
    
    const result = paginationSchema.safeParse(params);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }
    
    const { page, page_size } = result.data;
    const cacheKey = getConversationsCacheKey(page, page_size, userId);

    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log("Cache hit for conversations titles for user:", userId);
        return JSON.parse(cached);
    }

    const query = Conversation.find({ user: userId }).select("title");
    const res = await paginateQuery(query, page, page_size);

    if (!res.data || res.data.length === 0) {
        throw new AppError("No Conversations found", 404, "NOT_FOUND", "Please start a new Conversation");
    }

    await redis.set(cacheKey, JSON.stringify(res));
    await redis.sadd(conversationKeys, cacheKey);

    return res;
};


export const updateConversationService = async (userId: string, conversationId: string, body: unknown) => {
    const redis = getRedisClient();
    const cacheKey = getConversationCacheKey(conversationId, userId);

    const result = conversationSchema.partial().safeParse(body);
    if (!result.success) {
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { messages } = result.data;
    const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, { $push: { messages }}, { returnDocument: "after" });

    if (!updatedConversation) {
        throw new AppError("Conversation not found", 404, "NOT_FOUND", "Please provide a valid Conversation ID");
    }

    await redis.set(cacheKey, JSON.stringify(updatedConversation));
    return updatedConversation;
};

export const deleteConversationService = async (userId: string, conversationId: string) => {
    const redis = getRedisClient();
    const cacheKey = getConversationCacheKey(conversationId, userId);

    const conversation = await Conversation.findByIdAndDelete(conversationId);
    if (!conversation) {
        throw new AppError("Conversation not found", 404, "NOT_FOUND", "Please provide a valid Conversation ID");
    }

    await redis.del(cacheKey);
    const keys = await redis.smembers(conversationKeys);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    return conversation;
};
