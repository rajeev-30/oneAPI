import express from "express";
import userRoute from "../modules/user/user.routes";
import apiKeyRoute from "../modules/apiKey/apiKey.routes";
import billingRoute from "../modules/billing/billing.routes";
import providerRoute from "../modules/provider/provider.routes";
import modelRoute from "../modules/model/model.routes"

const app = express();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/key", apiKeyRoute);
app.use("/api/v1/billing", billingRoute);
app.use("/api/v1/provider", providerRoute);
app.use("/api/v1/model", modelRoute);

export default app;