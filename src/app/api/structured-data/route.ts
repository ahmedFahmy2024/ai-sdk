import { groq } from "@ai-sdk/groq";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(request: Request) {
  try {
    const { dish } = await request.json();

    const result = streamObject({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      schema: recipeSchema,
      prompt: `Generate a recipe for a dish called ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating structured data:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
