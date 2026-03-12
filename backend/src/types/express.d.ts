import "express";

declare module "express" {
    interface Request {
        userId?: string;  // ✅ module augmentation (more reliable than global)
    }
}