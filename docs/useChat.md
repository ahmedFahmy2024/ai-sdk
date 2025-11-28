# useChat Hook Documentation

## Overview

The `useChat` hook is a React hook from the AI SDK (`@ai-sdk/react`) that simplifies building chat interfaces. It manages the state of chat messages and handles communication with a backend API endpoint to stream responses from AI models.

## Features

- **Message Management**: Automatically manages the state of user and AI messages
- **Streaming Support**: Handles streaming responses from AI models in real-time
- **Status Tracking**: Provides status updates (ready, submitted, streaming)
- **Error Handling**: Captures and exposes errors that occur during chat operations
- **Stop Functionality**: Allows users to stop ongoing streaming operations

## API Reference

### Usage

```typescript
const { messages, sendMessage, status, error, stop } = useChat();
```

### Return Value

The hook returns an object with the following properties:

#### `messages`

- **Type**: `UIMessage[]`
- **Description**: Array of messages in the conversation
- **Structure**: Each message contains:
  - `id`: Unique identifier for the message
  - `role`: Either `"user"` or `"assistant"`
  - `parts`: Array of message content parts

#### `sendMessage`

- **Type**: `(message: { text: string }) => void`
- **Description**: Function to send a new message to the chat API
- **Parameters**:
  - `message`: An object containing the message text to send
- **Example**:
  ```typescript
  sendMessage({ text: "Hello, how are you?" });
  ```

#### `status`

- **Type**: `"ready" | "submitted" | "streaming"`
- **Description**: Current status of the chat
- **Values**:
  - `"ready"`: Ready to accept new messages (default state)
  - `"submitted"`: Message has been sent, waiting for response
  - `"streaming"`: Response is being streamed from the server

#### `error`

- **Type**: `Error | null`
- **Description**: Error object if an error occurred, otherwise `null`
- **Properties**:
  - `message`: Error message describing what went wrong

#### `stop`

- **Type**: `() => void`
- **Description**: Function to stop the current streaming operation
- **Usage**: Call this function to interrupt an ongoing response stream

## Example Implementation

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  // Initialize the useChat hook
  const { messages, sendMessage, status, error, stop } = useChat();

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {/* Display errors */}
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {/* Display messages */}
      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === "user" ? "You:" : "AI:"}
          </div>
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <div
                  key={`${message.id}-${index}`}
                  className="whitespace-pre-wrap"
                >
                  {part.text}
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}

      {/* Show loading indicator while streaming */}
      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        </div>
      )}

      {/* Chat input form */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you?"
          />
          {status === "submitted" || status === "streaming" ? (
            <button
              type="button"
              onClick={stop}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status !== "ready"}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Workflow

1. **User Interaction**: User enters text in the input field
2. **Send Message**: `handleSubmit` calls `sendMessage()` with the input text
3. **Status Change**: Hook status changes to `"submitted"`
4. **API Request**: Message is sent to the backend API endpoint
5. **Streaming**: Response begins streaming, status changes to `"streaming"`
6. **Message Updates**: Messages array is updated with assistant's response in real-time
7. **Complete**: When streaming finishes, status returns to `"ready"`
8. **Stop Option**: User can click "Stop" button to terminate streaming early

## Backend API Requirements

The `useChat` hook expects a backend endpoint (typically `/api/chat`) that:

- Accepts POST requests with a JSON body containing messages
- Returns a streaming response with the AI's message
- Supports cancellation/interruption of streams

Example backend route:

```typescript
import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
```

## Best Practices

- Always handle the `error` state and display user-friendly error messages
- Show a loading indicator while `status` is `"submitted"` or `"streaming"`
- Disable the submit button when status is not `"ready"`
- Provide a "Stop" button to let users cancel long-running operations
- Clear input field after sending a message
- Use the "use client" directive in Next.js since this hook uses React state

## Common Patterns

### Conditional Button Rendering

```typescript
{
  status === "submitted" || status === "streaming" ? (
    <button onClick={stop}>Stop</button>
  ) : (
    <button type="submit" disabled={status !== "ready"}>
      Send
    </button>
  );
}
```

### Error Display

```typescript
{
  error && <div className="text-red-500">{error.message}</div>;
}
```

### Loading Indicator

```typescript
{
  (status === "submitted" || status === "streaming") && (
    <div className="loading-spinner">Loading...</div>
  );
}
```
