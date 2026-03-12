import {z} from 'zod';

export const nameValidation = z
    .string("Name is required")
    .min(2, "Name must be atleast 2 characters")
    .max(20, "Name must be no more that 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/,"Name must not contain special characters")


export const signupInput = z.object({
    name: nameValidation,
    email: z.string("Email is required").email({message:"Invalid email address"}),
    password: z.string("Password is required").min(6, {message: "Password must be atlest 6 characters"})
})

export const loginInput = z.object({     
    email: z.string("Email is required").email({ message: "Invalid email address" }),
    password: z.string("Password is required").min(6, { message: "Password must be at least 6 characters" })
})