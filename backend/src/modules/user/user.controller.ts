import { sendResponse } from "@utils/response";
import { generateAuthToken, getUserService, loginService, signupService, updateUserService } from "./user.service";
import {Request, Response} from "express"
import { sendErrorResponse } from "@utils/errorResponse";


export const SignUp = async (req: Request, res: Response) => {
    try{
        const newUser = await signupService(req.body);
        const token = generateAuthToken(newUser._id.toString());

        return res.status(201)
        .cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'none',
        })
        .json({
            message: "User registered successfully",
            success: true,
            data: newUser
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "SignUp failed due to server issue")
    }
}


export const Login = async (req: Request, res: Response)=> {
    try{
        const user = await loginService(req.body);

        // Generate JWT token
        const token = generateAuthToken(user._id.toString());

        return res.status(200)
        .cookie('token', token, {
            httpOnly:true, 
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'none',
        })
        .json({
            message: "User logged in successfully",
            success: true,
            data: user
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "Login failed due to server issue")
    }
}

export const Logout  = async(_req: Request, res: Response) => {
    try{
        return res.status(200)
        .clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        .json({
            message: "You logged out successfully",
            success: true
        })
    }catch(error){
        return sendErrorResponse(res, error, 500, "Logout failed due to server issue")
    }
}

export const getUser = async(req: Request, res: Response) => {
    try{
        const userId = req.userId as string;
        const user = await getUserService(userId);

        return sendResponse(res, 200, {
            message: "User found successfully",
            success: true,
            data: user
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "GetUser failed due to server issue")
    }
}

export const updateUser = async(req: Request, res: Response) => {
    try{
        const userId = req.userId as string;
        const updatedUser = await updateUserService(userId, req.body);

        return sendResponse(res, 200, {
            message: "User updated successfully",
            success: true,
            data: updatedUser
        });
    }catch(error){
        return sendErrorResponse(res, error, 500, "UpdateUser failed due to server issue")
    }
}