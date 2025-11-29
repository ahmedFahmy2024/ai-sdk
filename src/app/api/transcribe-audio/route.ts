import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const transcript = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: uint8Array,
    });

    return Response.json({ transcript });
  } catch (error) {
    console.error("Error during transcription:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
