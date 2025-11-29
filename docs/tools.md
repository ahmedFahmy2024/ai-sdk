# Tools

Tools enable AI models to interact with external systems and perform actions beyond text generation. They allow models to call functions that retrieve information or execute tasks.

## Overview

The tools feature allows you to define custom functions that an AI model can call during a conversation. This is useful for:

- Retrieving real-time information (weather, stock prices, etc.)
- Performing calculations or data processing
- Integrating with external APIs
- Creating interactive, multi-step conversations

## Basic Example

### Define Tools

Tools are defined using the `tool` function with a schema and execution logic:

```typescript
import { tool } from "ai";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get the current weather for a given location.",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for."),
    }),
    execute: async ({ city }) => {
      // Your implementation here
      return `The current weather in ${city} is...`;
    },
  }),
};
```

### Use Tools in streamText

Pass tools to the `streamText` function to enable the model to use them:

```typescript
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

const result = streamText({
  model: google("gemini-2.5-flash"),
  messages: convertToModelMessages(messages),
  tools, // Enable tools
});
```

## Tool Structure

Each tool requires:

- **description**: A clear description of what the tool does
- **inputSchema**: A Zod schema defining the tool's input parameters
- **execute**: An async function that performs the tool's action

### Example: Weather Tool

```typescript
const getWeather = tool({
  description: "Get the current weather for a given location.",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  execute: async ({ city }) => {
    if (city === "Cairo") {
      return "The current weather in Cairo is 30°C, sunny.";
    } else if (city === "Alexandria") {
      return "The current weather in Alexandria is 22°C, partly cloudy.";
    } else {
      return `Sorry, I don't have the weather information for ${city}.`;
    }
  },
});
```

## UI Integration

### Type Inference

Use `InferUITools` to infer types for UI components:

```typescript
export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
```

### Displaying Tool Results

In your UI component, render tool results based on their state:

```typescript
case "tool-getWeather":
  switch (part.state) {
    case "input-streaming":
      return <div>Receiving weather request...</div>;
    case "input-available":
      return <div>Getting weather for {part.input.city}...</div>;
    case "output-available":
      return <div>Weather: {part.output}</div>;
    case "output-error":
      return <div>Error: {part.errorText}</div>;
  }
```

## Tool States

Tools go through multiple states during execution:

- **input-streaming**: Tool input is being received from the model
- **input-available**: Tool input is complete and ready to execute
- **output-available**: Tool execution completed successfully
- **output-error**: An error occurred during tool execution

## Step Control

Use `stepCountIs` to limit the number of tool invocations:

```typescript
const result = streamText({
  model: google("gemini-2.5-flash"),
  messages: convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(2), // Stop after 2 steps
});
```

This is useful for controlling conversation flow and preventing excessive tool calls.

## Best Practices

1. **Clear Descriptions**: Provide detailed descriptions for each tool so the model understands when to use it
2. **Input Validation**: Use Zod schemas to validate and describe tool parameters
3. **Error Handling**: Handle errors gracefully in the execute function
4. **Async Operations**: Tools can perform async operations like API calls
5. **Step Limits**: Consider using `stepCountIs` to prevent infinite tool loops

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai/)
- [Zod Documentation](https://zod.dev/)
- [Tool Types and Interfaces](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tools)
