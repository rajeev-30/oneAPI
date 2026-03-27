import { getRedisClient } from "@config/redis";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Limits {
    requestsPerMinute: number;
    tokensPerMinute: number;
    requestsPerDay: number;
    tokensPerDay: number;
}

interface CheckInput {
    userId: string;
    estimatedTokens: number;
    limits: Limits;
}

interface RecordInput {
    userId: string;
    actualTokens: number;
}

interface LimitResult {
    allowed: boolean;
    reason?: string;
    usage?: {
        requestsMinute: number;
        tokensMinute: number;
        requestsDay: number;
        tokensDay: number;
    };
}

// ─── Time Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns a UTC minute-aligned bucket string: YYYYMMDDHHmm
 * Used as part of Redis keys so each minute gets its own key,
 * preventing the rolling-window race condition from a single TTL key.
 */
const getMinuteBucket = (): string => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const h = String(now.getUTCHours()).padStart(2, "0");
    const min = String(now.getUTCMinutes()).padStart(2, "0");
    return `${y}${m}${d}${h}${min}`;
};

/** Returns ISO date string YYYY-MM-DD in UTC. */
const getDayKey = (): string => new Date().toISOString().slice(0, 10);

/** Seconds remaining until the next UTC minute boundary (min 1). */
const secondsToNextUtcMinute = (): number => {
    const now = new Date();
    return Math.max(1, 60 - now.getUTCSeconds());
};

/** Seconds remaining until midnight UTC (min 1). */
const secondsToNextUtcDay = (): number => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
    ));
    return Math.max(1, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
};

// ─── Key Builder ──────────────────────────────────────────────────────────────

/**
 * Builds all four Redis keys for a given user.
 *
 * Minute keys include the wall-clock bucket (YYYYMMDDHHmm) so limits are
 * always aligned to real UTC minutes — not a sliding window from the first
 * request. TTL is still set so stale keys are cleaned up automatically.
 *
 * Day keys include the UTC date so each calendar day is isolated.
 */
const buildKeys = (userId: string) => {
    const bucket = getMinuteBucket();
    const day = getDayKey();
    return {
        reqMin: `rl:plan:${userId}:req:min:${bucket}`,
        tokMin: `rl:plan:${userId}:tok:min:${bucket}`,
        reqDay: `rl:plan:${userId}:req:day:${day}`,
        tokDay: `rl:plan:${userId}:tok:day:${day}`,
    };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Checks whether a request is within all four rate-limit dimensions.
 * Does NOT increment counters — call recordActualUsage() after a
 * successful request completes.
 *
 * Returns allowed=true plus current usage snapshots on success,
 * or allowed=false with a human-readable reason on rejection.
 */
export const checkPlanLimits = async (input: CheckInput): Promise<LimitResult> => {
    const redis = getRedisClient();
    const { userId, limits } = input;
    const estimatedTokens = Math.max(1, Number(input.estimatedTokens || 1));

    const k = buildKeys(userId);

    const [reqMinRaw, tokMinRaw, reqDayRaw, tokDayRaw] = await redis.mget(
        k.reqMin,
        k.tokMin,
        k.reqDay,
        k.tokDay
    );

    const reqMin = Number(reqMinRaw || 0);
    const tokMin = Number(tokMinRaw || 0);
    const reqDay = Number(reqDayRaw || 0);
    const tokDay = Number(tokDayRaw || 0);

    if (reqMin + 1 > limits.requestsPerMinute) {
        return { allowed: false, reason: "Minute request limit reached." };
    }
    if (tokMin + estimatedTokens > limits.tokensPerMinute) {
        return { allowed: false, reason: "Minute token limit reached." };
    }
    if (reqDay + 1 > limits.requestsPerDay) {
        return { allowed: false, reason: "Daily request limit reached." };
    }
    if (tokDay + estimatedTokens > limits.tokensPerDay) {
        return { allowed: false, reason: "Daily token limit reached." };
    }

    return {
        allowed: true,
        usage: {
            requestsMinute: reqMin,
            tokensMinute: tokMin,
            requestsDay: reqDay,
            tokensDay: tokDay,
        },
    };
};

/**
 * Records actual token usage after a request completes.
 * Uses a pipeline for atomicity and minimal round-trips.
 *
 * TTL is always refreshed to the remaining time in the current
 * UTC minute / day window — never beyond it.
 *
 * Note: limits are intentionally NOT required here; recording usage
 * is a pure side-effect and should not re-validate policy.
 */
export const recordActualUsage = async (input: RecordInput): Promise<void> => {
    const redis = getRedisClient();
    const { userId } = input;
    const actualTokens = Math.max(1, Number(input.actualTokens || 1));

    const k = buildKeys(userId);
    const minTtl = secondsToNextUtcMinute();
    const dayTtl = secondsToNextUtcDay();

    const pipeline = redis.pipeline();

    pipeline.incrby(k.reqMin, 1);
    pipeline.expire(k.reqMin, minTtl);
    pipeline.incrby(k.tokMin, actualTokens);
    pipeline.expire(k.tokMin, minTtl);

    pipeline.incrby(k.reqDay, 1);
    pipeline.expire(k.reqDay, dayTtl);
    pipeline.incrby(k.tokDay, actualTokens);
    pipeline.expire(k.tokDay, dayTtl);

    await pipeline.exec();
};