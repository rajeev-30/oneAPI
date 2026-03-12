import express from "express";
import userRoute from "../modules/user/user.routes";

const app = express();

app.use("/api/v1/user", userRoute);

export default app;