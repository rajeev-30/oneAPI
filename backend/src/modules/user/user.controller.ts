import { sendResponse } from "@utils/response";
import User from "./user.model";
import { comparePassword, generateAuthToken } from "./user.service";
import { signupInput, loginInput } from "./user.validation";
import bcrypt from "bcryptjs"
import {Request, Response} from "express"


export const SignUp = async (req: Request, res: Response) => {
    try{
        const result = signupInput.safeParse(req.body);
        
        if(!result.success){
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false
            });
        }
        
        const { name, email, password } = result.data;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 409, {
                message: "User already exists",
                success: false
            });
        }

        // Create new user
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPass });
        await newUser.save();
        const token = generateAuthToken(newUser._id.toString());


        return res.status(201)
        .cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        })
        .json({
            message: "User registered successfully",
            success: true,
            data: newUser
        });
    }catch(error){
        console.log("SignUp failed: " + error);
        return sendResponse(res, 500, {
            message: "SignUp failed due to server issue",
            success: false,
            error:error instanceof Error ? error.message : "Unknown error"
        })
    }
}


export const Login = async (req: Request, res: Response)=> {
    try{
        const result = loginInput.safeParse(req.body);
        if(!result.success){
            return sendResponse(res, 400, {
                message: result.error.issues[0].message,
                success: false
            });
        }
        const { email, password } = result.data;

        // Validate user credentials
        const user = await User.findOne({ email });
        if (!user || !comparePassword(password, user.password)) {
            return sendResponse(res, 401, {
                message: "Invalid email or password",
                success: false,
            });
        }

        // Generate JWT token
        const token = generateAuthToken(user._id.toString());

        return res.status(200)
        .cookie('token', token, {
            httpOnly:true, 
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
        })
        .json({
            message: "User logged in successfully",
            success: true,
            data: user
        });
    }catch(error){
        console.log("Login failed: " + error);
        return sendResponse(res, 500, {
            message: "Login failed due to server issue",
            success: false,
            error:error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const Logout  = async(_req: Request, res:Response) => {
    try{
        return res.status(200)
        .clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
        .json({
            message: "You logged out successfully",
            success: true
        })
    }catch(error){
        console.log("Logout failed: " + error);
        return sendResponse(res, 500, {
            message: "Logout failed due to server issue",
            success: false,
            error:error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const getUser = async(req:Request, res:Response) => {
    try{
        const id = req.userId;
        const user = await User.findById(id).select("-password");
        if(!user){
            return sendResponse(res, 404, {
                message: "User not found",
                success: false
            });
        }
        return sendResponse(res, 200, {
            message: "User found successfully",
            success: true,
            data: user
        });
    }catch(error){
        console.log("GetUser failed: " + error);
        return sendResponse(res, 500, {
            message: "GetUser failed due to server issue",
            success: false,
            error:error instanceof Error ? error.message : "Unknown error"
        })
    }
}