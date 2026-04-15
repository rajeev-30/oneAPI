import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import User from "./user.model";
import { signupSchema, loginSchema } from "./user.validation";
import { AppError } from '../../types/errors';
import { getRedisClient } from '@config/redis';

const getUserCacheKey = (userId: string): string => `user:${userId}`;

const comparePassword = async (password: string, userPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, userPassword);
}

export const generateAuthToken = (userId: string) : String => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
}

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const signupService = async (body: unknown) => {
    const redis = getRedisClient();

    const result = signupSchema.safeParse(body);
    if(!result.success){
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { name, email, password } = result.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 400, "ALREADY_EXISTS", existingUser);
    }

    const hashedPass = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPass });
    await newUser.save();

    const cacheKey = getUserCacheKey(newUser._id.toString());
    await redis.set(cacheKey, JSON.stringify(newUser));
    return newUser;
}

export const loginService = async (body: unknown) => {
    const redis = getRedisClient();
    const result = loginSchema.safeParse(body);
    if(!result.success){
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email });
    if (!user || !await comparePassword(password, user.password)) {
        throw new AppError("Invalid email or password", 401, "UNAUTHORIZED", "Please provide valid credentials");
    }

    const cacheKey = getUserCacheKey(user._id.toString());
    await redis.set(cacheKey, JSON.stringify(user));
    return user;
}

export const getUserService = async (userId: string) => {
    const redis = getRedisClient();
    const cacheKey = getUserCacheKey(userId);
    
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not found", 404, "NOT_FOUND", "Please provide a valid user ID");
    }

    await redis.set(cacheKey, JSON.stringify(user));
    return user;
}

export const updateUserService = async (userId: string, body: unknown) => {
    const redis = getRedisClient();
    const cacheKey = getUserCacheKey(userId);

    const result = signupSchema.partial().safeParse(body);
    if(!result.success){
        throw new AppError(result.error.issues[0].message, 400, "VALIDATION_ERROR", result.error.issues);
    }

    const updateData: any = { ...result.data };
    if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { returnDocument: "after" }).select("-password");
    if (!updatedUser) {
        throw new AppError("User not found", 404, "NOT_FOUND", "Please provide a valid user ID");
    }

    await redis.set(cacheKey, JSON.stringify(updatedUser));
    return updatedUser;
}