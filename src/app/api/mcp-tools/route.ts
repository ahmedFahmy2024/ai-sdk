import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { google } from "@ai-sdk/google";

const tools = {
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      if (city === "Gotham City") {
        return "70°F and cloudy";
      } else if (city === "Metropolis") {
        return "80°F and sunny";
      } else {
        return "Unknown";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const httpTransport = new StreamableHTTPClientTransport(
      new URL("https://app.mockmcp.com/servers/G2wPh4nrO13s/mcp"),
      {
        requestInit: {
          headers: {
            Authorization:
              "Bearer mcp_m2m_cRYYCogzAZ6n9RJVi-hIo83qeLFqaArYmS-X5wQyFkw_c5f9c265abd2e755",
          },
        },
      }
    );

    const mcpClient = await experimental_createMCPClient({
      transport: httpTransport,
    });

    const mcpTools = await mcpClient.tools();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools: { ...tools, ...mcpTools },
      stopWhen: stepCountIs(2),
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error) => {
        await mcpClient.close();
        console.error("Error during streaming:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
