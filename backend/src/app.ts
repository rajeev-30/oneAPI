import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/v1.routes";

const app = express();

// Security
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: ["https://oneapi-rx.vercel.app", "https://admin-oneapi.vercel.app", "http://localhost:3000", "http://localhost:3001"],
    credentials: true, 
}));
app.use(cookieParser());

// Compression
// app.use(compression());

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", routes);

export default app;