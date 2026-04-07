import http from "http";
import mongoose from "mongoose";
import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";
import { initRedis, closeRedis } from "./config/redis";
import { startSubscriptionExpiryCron } from "./jobs/expireSubscription.job";


const PORT = process.env.PORT || 9000;

async function startServer() {
  try {
    // Connect MongoDB, Redis
    await connectDB();
    await initRedis();

    // Cron job to expire subscriptions daily at midnight
    startSubscriptionExpiryCron();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

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