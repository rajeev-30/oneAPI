import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";
import { initRedis, closeRedis } from "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Connect MongoDB, Redis
    await connectDB();
    await initRedis();

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    async function shutdown() {
      console.log("Shutting down...");
      try {
        await closeRedis();
        await mongoose.connection.close();
      } finally {
        server.close(() => process.exit(0));
      }
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();