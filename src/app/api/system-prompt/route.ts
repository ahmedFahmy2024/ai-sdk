// app/api/chat/route.ts
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content:
            "You are a friendly teacher who explains concepts using simple analogies. Always relate concepts to everyday experiences",
        },
        ...convertToModelMessages(messages),
      ],
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}

// another example of system prompt
// const result = streamText({
//   model: groq("llama-3.1-8b-instant"),
//   messages: [
//     {
//       role: "system",
//       content: "Convert user questions about react into code examples.",
//     },
//     {
//       role: "user",
//       content: "How to toggle a boolean?",
//     },
//     {
//       role: "assistant",
//       content:
//         "const [isToggled, setIsToggled] = useState(false);\n\nfunction toggle() {\n  setIsToggled(!isToggled);\n}",
//     },
//     ...convertToModelMessages(messages),
//   ],
// });
