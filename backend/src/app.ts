import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import routes from "./routes";
import errorMiddleware from "./middlewares/error.middleware.ts";

const app = express();

// Security
app.use(helmet());

// Enable CORS
app.use(cors());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// Global error handler
app.use(errorMiddleware);

export default app;