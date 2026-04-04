import z from "zod";
    
export const modelSchema = z.object({
    name: z.string("Name is required and must be a string").min(2, { message: "Name must be atleast 2 characters" }),
    slug: z.string("Slug is required and must be a string").min(2, { message: "Slug must be atleast 2 characters" }),
    provider: z.string("Provider is required and must be a string"),
    billing: z.string("Billing is required and must be a string")
});