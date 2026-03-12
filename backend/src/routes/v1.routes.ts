import express from "express";
import userRoute from "../modules/user/user.routes";
import apiKeyRoute from "../modules/apiKey/apiKey.routes";

const app = express();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/key", apiKeyRoute);

export default app;