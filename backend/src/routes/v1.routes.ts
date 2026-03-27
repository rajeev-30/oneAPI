import express from "express";
import userRoute from "../modules/user/user.routes";
import apiKeyRoute from "../modules/apiKey/apiKey.routes";
import billingRoute from "../modules/billing/billing.routes";
import providerRoute from "../modules/provider/provider.routes";
import modelRoute from "../modules/model/model.routes"
import gatewayRoute from "../modules/gateway/gateway.routes";
import planRoute from "../modules/plan/plan.routes";
import walletRoute from "../modules/wallet/wallet.routes";




const app = express();

app.use("/user", userRoute);
app.use("/key", apiKeyRoute);
app.use("/billing", billingRoute);
app.use("/provider", providerRoute);
app.use("/model", modelRoute);
app.use("/chat", gatewayRoute);
app.use("/plan", planRoute);
app.use("/wallet", walletRoute);

export default app;