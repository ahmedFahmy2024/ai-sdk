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
      if (city === "Cairo") {
        return "The current weather in Cairo is 30°C, sunny.";
      } else if (city === "Alexandria") {
        return "The current weather in Alexandria is 22°C, partly cloudy.";
      } else {
        return `Sorry, I don't have the weather information for ${city}.`;
      }
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
