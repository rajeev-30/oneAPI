import { AppError } from "../types/errors";
import Redis from "ioredis";

let redisClient: Redis | null = null;

export const initRedis = async (): Promise<Redis> => {
    if (redisClient) return redisClient;

    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    redisClient = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
    });

    redisClient.on("connect", () => {
        console.log("Redis connected");
    });

    redisClient.on("error", (err) => {
        console.error("Redis error:", err.message);
    });

    await redisClient.ping();
    return redisClient;
};

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        throw new AppError("Redis client is not initialized.", 500, "INTERNAL_SERVER_ERROR", "Redis client is not initialized.");
    }
    return redisClient;
};

export const closeRedis = async (): Promise<void> => {
    if (!redisClient) return;
    await redisClient.quit();
    redisClient = null;
};