import { groq } from "@ai-sdk/groq";
import { streamObject } from "ai";
import { pokemonSchema } from "./schema";

export async function POST(request: Request) {
  try {
    const { type } = await request.json();

    const result = streamObject({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      output: "array", // Specify that we want an array output
      schema: pokemonSchema, // we pass single pokemon schema not array
      prompt: `Generate a List of 5 ${type} Pokemon.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating structured data:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
