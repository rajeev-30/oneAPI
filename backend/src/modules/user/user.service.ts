import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

export const comparePassword = async (password: string, userPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, userPassword);
}

export const generateAuthToken = (userId: string) : String => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
}