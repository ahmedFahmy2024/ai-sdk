import { streamText, UIMessage, convertToModelMessages } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"), // this is a multimodal model work with images and text
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming multi modal chat:", error);
    return new Response("Failed to stream multi modal chat", { status: 500 });
  }
}
