import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import {Types} from "mongoose"

export const comparePassword = async (password: string, userPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, userPassword);
}

export const generateAuthToken = (userId: Types.ObjectId) : String => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'xxxxx', { expiresIn: '30d' });
}