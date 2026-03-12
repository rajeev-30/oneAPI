import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

export const comparePassword = async (password: string, userPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, userPassword);
}

export const generateAuthToken = (userId: any) : String => {
    const tokenData = userId;
    return jwt.sign({ id: tokenData }, process.env.JWT_SECRET || 'xxxxx', { expiresIn: '30d' });
}