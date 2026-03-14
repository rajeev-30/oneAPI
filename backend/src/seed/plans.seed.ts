import Plan from "@modules/plan/plan.model";

const plans = [
    {
        name:  "Free",
        price: 0,
        limits: {
            requestsPerMonth:  100,
            tokensPerMonth:    50000,
            requestsPerMinute: 5,
            tokensPerMinute:   1000,
        },
        features: ["Groq Models", "Google Models", "Stream Support"]
    },
    {
        name:  "Pro",
        price: 20,
        limits: {
            requestsPerMonth:  10000,
            tokensPerMonth:    5000000,
            requestsPerMinute: 60,
            tokensPerMinute:   100000,
        },
        features: ["All Models", "Stream Support", "Priority Support", "Higher Rate Limits"]
    },
    {
        name:  "Enterprise",
        price: 100,
        limits: {
            requestsPerMonth:  100000,
            tokensPerMonth:    50000000,
            requestsPerMinute: 600,
            tokensPerMinute:   1000000,
        },
        features: ["All Models", "Custom Rate Limits", "Dedicated Support", "SLA"]
    }
];

export const seedPlans = async () => {
    await Plan.insertMany(plans);
    console.log("Plans seeded ✅");
}