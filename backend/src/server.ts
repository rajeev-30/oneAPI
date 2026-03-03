import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import connectRedis from "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB connected");

    // Redis
    await connectRedis();
    console.log("✅ Redis connected");

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    async function shutdown() {
      console.log("🛑 Shutting down...");
      await mongoose.connection.close();
      server.close(() => {
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();