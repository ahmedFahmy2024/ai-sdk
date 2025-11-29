import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  tool,
  type UIMessage,
  type InferUITools,
  type UIDataTypes,
  stepCountIs,
} from "ai";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get the current weather for a given location.",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for."),
    }),
    execute: async ({ city }) => {
      const response = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
      );
      const data = await response.json();
      const weatherData = {
        location: {
          name: data.location.name,
          country: data.location.country,
          localtime: data.location.localtime,
        },
        current: {
          temp_c: data.current.temp_c,
          condition: {
            text: data.current.condition.text,
            code: data.current.condition.code,
          },
        },
      };
      return weatherData;
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools, // we add the tools here to be able to use it
      stopWhen: stepCountIs(2), // step 1 for calling our weather tool, step 2 for processing the result and returning response back to the user
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
