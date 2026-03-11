import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import { Response } from "express";
// import connectRedis from "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // MongoDB
    await connectDB();

    // Redis
    // await connectRedis();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    app.get("/", (_, res: Response) => {
      res.send("Hello World!");
    });

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    async function shutdown() {
      console.log("Shutting down...");
      await mongoose.connection.close();
      server.close(() => {
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();