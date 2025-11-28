import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Changed from streamObject to generateObject
    const result = await generateObject({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      output: "enum", // Specify that we want an enum output
      enum: ["positive", "negative", "neutral"], // Define the enum values
      prompt: `Classify the sentiment in this text: "${text}`,
    });

    return result.toJsonResponse(); // Changed to toJsonResponse
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return new Response("Failed to generate sentiment", { status: 500 });
  }
}
