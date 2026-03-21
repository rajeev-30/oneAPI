import z from "zod";
    
export const modelSchema = z.object({
    name: z.string("Name is required").min(2, { message: "Name must be atleast 2 characters" }),
    slug: z.string("Slug is required").min(2, { message: "Slug must be atleast 2 characters" }),
    provider: z.string("Provider is required"),
    billing: z.string("Billing is required")
});