import express from "express";
import userRoute from "../modules/user/user.routes";
import apiKeyRoute from "../modules/apiKey/apiKey.routes";
import billingRoute from "../modules/billing/billing.routes";
import providerRoute from "../modules/provider/provider.routes";
import modelRoute from "../modules/model/model.routes"
import gatewayRoute from "../modules/gateway/gateway.routes";
import planRoute from "../modules/plan/plan.routes";
import walletRoute from "../modules/wallet/wallet.routes";
import usageRoute from "../modules/usage/usage.routes";
import subscriptionRoute from "../modules/subscription/subscription.routes";

const app = express();

app.use("/user", userRoute);
app.use("/key", apiKeyRoute);
app.use("/billing", billingRoute);
app.use("/provider", providerRoute);
app.use("/model", modelRoute);
app.use("/chat", gatewayRoute);
app.use("/plan", planRoute);
app.use("/wallet", walletRoute);
app.use("/usage", usageRoute);
app.use("/subscription", subscriptionRoute);

export default app;