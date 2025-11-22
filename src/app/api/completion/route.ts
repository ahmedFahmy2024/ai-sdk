import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
    });

    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to generate text" });
  }
}
