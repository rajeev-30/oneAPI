import axios from "axios";
import { response } from "express";
import { createParser } from "eventsource-parser";
import { AppError } from "../../types/errors";
import { sendErrorResponse } from "@utils/errorResponse";

// const parser = createParser((event: any) =>  {
//   if (event.type === "event") {
//     if (event.data === "[DONE]") return;

//     const json = JSON.parse(event.data);
//     console.log(json.choices[0].delta.content);
//   }
// });



export const generateChat = async (Body: unknown) => {
    try {
        const oneapi_endpoint = process.env.ONEAPI_CHAT_COMPLETION_ENDPOINT as string;

        if(!oneapi_endpoint) {
            throw new AppError("ONEAPI_CHAT_COMPLETION_ENDPOINT is not defined", 400, "NOT_FOUND", "Please set ONEAPI_CHAT_COMPLETION_ENDPOINT in your .env");
        }

        const headers = {
            "Authorization": `Bearer ${Body?.token}`,
            "Content-Type": "application/json"
            };

            const data = {
            model: "openai/gpt-4o",
            messages: [
                { role: "user", content: "Hello!" }
            ]
        };
        const response = await axios.post(oneapi_endpoint, data, { headers, responseType: "stream" });
        return response.data;
    } catch (error) {
        throw new AppError("Error generating chat");
    }
};
