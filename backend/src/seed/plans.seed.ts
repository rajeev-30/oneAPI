import Plan from "@modules/plan/plan.model";

const plans = [
    {
        name:  "Free",
        price: 0,
        limits: {
            requestsPerDay:    20,
            tokensPerDay:    10000,
            requestsPerMinute: 5,
            tokensPerMinute:   1000,
        },
        features: ["Groq Models", "Google Models", "Stream Support"]
    },
    {
        name:  "Pro",
        price: 20,
        limits: {
            requestsPerDay:    100,
            tokensPerDay:    100000,
            requestsPerMinute: 60,
            tokensPerMinute:   100000,
        },
        features: ["All Models", "Stream Support", "Priority Support", "Higher Rate Limits"]
    },
    {
        name:  "Enterprise",
        price: 100,
        limits: {
            requestsPerDay:  1000,
            tokensPerDay:    1000000,
            requestsPerMinute: 600,
            tokensPerMinute:   100000,
        },
        features: ["All Models", "Custom Rate Limits", "Dedicated Support", "SLA"]
    }
];

export const seedPlans = async () => {
    await Plan.insertMany(plans);
    console.log("Plans seeded ✅");
}