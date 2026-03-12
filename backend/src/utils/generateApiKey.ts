import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const generateAuthToken = (id: Types.ObjectId): string => {
    return jwt.sign(
        { userId: id.toString() }, // ✅ key must be "userId" not "_id" or "id"
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
    );
}