# Multiple Tools

Working with multiple tools allows AI models to choose between different actions and combine them to accomplish complex tasks. This guide covers how to define, manage, and display multiple tools in a single conversation.

## Overview

Multiple tools enable:

- Models to select the most appropriate tool for a task
- Chaining multiple tool calls together
- Building complex workflows with interdependent operations
- Real-world scenarios requiring multiple data sources or actions

## Basic Example

### Define Multiple Tools

Define each tool independently, then combine them in a tools object:

```typescript
const tools = {
  getLocation: tool({
    description: "Get the location of a user",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async ({ name }) => {
      if (name === "Bruce Wayne") {
        return "Gotham City";
      } else if (name === "Clark Kent") {
        return "Metropolis";
      } else {
        return "Unknown";
      }
    },
  }),
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
```

### Use in streamText

```typescript
const result = streamText({
  model: google("gemini-2.5-flash"),
  messages: convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(3), // Allows multiple steps for tool calls
});
```

## Tool Chaining Example

With multiple tools, models can chain calls together. For example:

1. User asks: "What's the weather for Bruce Wayne?"
2. Model calls `getLocation("Bruce Wayne")` → returns "Gotham City"
3. Model calls `getWeather("Gotham City")` → returns "70°F and cloudy"
4. Model provides final answer

## Backend Implementation

### Route Handler

```typescript
import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  InferUITools,
  UIMessage,
  UIDataTypes,
} from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";

const tools = {
  // Define all tools here
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3), // Control conversation depth
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
```

## Frontend Implementation

### Chat Component

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { ChatMessage } from "@/app/api/multiple-tools/route";

export default function MultipleToolsChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/multiple-tools",
    }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === "user" ? "You:" : "AI:"}
          </div>
          {message.parts.map((part, index) => {
            // Render different part types
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>{/* Form UI */}</form>
    </div>
  );
}
```

## Rendering Multiple Tool Results

Handle each tool type separately in the UI:

```typescript
{
  message.parts.map((part, index) => {
    switch (part.type) {
      case "text":
        return <div className="whitespace-pre-wrap">{part.text}</div>;

      case "tool-getLocation":
        return renderLocationTool(part, message.id, index);

      case "tool-getWeather":
        return renderWeatherTool(part, message.id, index);

      default:
        return null;
    }
  });
}
```

### Tool Rendering Helper

Each tool part can have different states:

```typescript
function renderLocationTool(part, messageId, index) {
  switch (part.state) {
    case "input-streaming":
      return (
        <div className="bg-zinc-800/50 border border-zinc-700 p-2 rounded">
          <div className="text-sm text-zinc-500">
            📍 Receiving location request...
          </div>
          <pre className="text-xs text-zinc-600 mt-1">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        </div>
      );
    case "input-available":
      return (
        <div className="bg-zinc-800/50 border border-zinc-700 p-2 rounded">
          <div className="text-sm text-zinc-400">
            📍 Getting location for {part.input.name}...
          </div>
        </div>
      );
    case "output-available":
      return (
        <div className="bg-zinc-800/50 border border-zinc-700 p-2 rounded">
          <div className="text-sm text-zinc-400">📍 Location found</div>
          <div className="text-sm text-zinc-300">{part.output}</div>
        </div>
      );
    case "output-error":
      return (
        <div className="bg-zinc-800/50 border border-zinc-700 p-2 rounded">
          <div className="text-sm text-red-400">Error: {part.errorText}</div>
        </div>
      );
  }
}
```

## Tool States

Each tool part transitions through these states:

- **input-streaming**: Tool input is being streamed from the model
- **input-available**: Tool input is complete and ready
- **output-available**: Tool executed successfully
- **output-error**: Tool execution failed

## Step Control

Use `stepCountIs` to control the depth of tool chaining:

```typescript
// Allow 3 steps: initial call + 2 tool calls
stopWhen: stepCountIs(3);

// Allow 5 steps for more complex workflows
stopWhen: stepCountIs(5);
```

This prevents infinite loops and controls conversation complexity.

## Best Practices

1. **Clear Tool Descriptions**: Each tool needs a distinct, clear description so the model knows when to use it
2. **Logical Grouping**: Group related tools together (e.g., data retrieval tools)
3. **Input Validation**: Use Zod schemas to validate all tool parameters
4. **Step Limits**: Set appropriate `stepCountIs` limits based on your workflow complexity
5. **Error Handling**: Implement graceful error handling in tool execute functions
6. **Tool UI Feedback**: Provide visual feedback for each tool state in the UI
7. **Distinct Icons/Styling**: Use different emojis or colors for different tools to improve UX

## Practical Example: User Weather Lookup

A practical workflow demonstrating multiple tools:

```typescript
// User: "What's the weather for Clark Kent?"

// Step 1: Initial message
// Step 2: Model calls getLocation("Clark Kent")
//         Returns: "Metropolis"
// Step 3: Model calls getWeather("Metropolis")
//         Returns: "80°F and sunny"
// Final: Model provides answer: "Clark Kent is in Metropolis where it's 80°F and sunny"
```

## Related Documentation

- [Tools](./tools.md) - Single tool implementation
- [AI SDK Documentation](https://sdk.vercel.ai/)
- [Tool Types and Interfaces](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tools)
