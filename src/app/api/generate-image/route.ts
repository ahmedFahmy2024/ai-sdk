import { togetherai } from "@ai-sdk/togetherai";
import { experimental_generateImage as generateImage } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const { image } = await generateImage({
      model: togetherai.image("black-forest-labs/FLUX.1-schnell-Free"),
      prompt,
      size: "1024x1024",
    });

    if (!image) {
      return Response.json(
        { error: "No image was generated. Try a different prompt." },
        { status: 500 }
      );
    }

    // Return the base64 image data
    return Response.json({
      base64: image.base64,
      mediaType: "image/png"
    });
  } catch (error) {
    console.error("Error generating image:", error);

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return Response.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }
      if (error.message.includes("not found")) {
        return Response.json(
          { error: "Model not found. Please check the model name." },
          { status: 404 }
        );
      }
      if (error.message.includes("API key")) {
        return Response.json(
          { error: "Invalid API key. Please check your TOGETHER_API_KEY." },
          { status: 401 }
        );
      }
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}
