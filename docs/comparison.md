# AI SDK Patterns Comparison Guide

## Overview

This guide compares the three main patterns in the Vercel AI SDK: `generateText`, `streamText`, and `useChat`. Each pattern serves different use cases and has distinct characteristics.

## Quick Comparison Table

| Feature              | generateText    | streamText              | useChat                 |
| -------------------- | --------------- | ----------------------- | ----------------------- |
| **Response Type**    | Complete        | Progressive (Streaming) | Progressive (Streaming) |
| **User Feedback**    | Delayed         | Immediate               | Immediate               |
| **Perceived Speed**  | Slower          | Faster                  | Faster                  |
| **Implementation**   | Simple          | Medium                  | Complex                 |
| **Can Stop Early**   | No              | Yes                     | Yes                     |
| **State Management** | Manual          | Manual                  | Automatic               |
| **Best For**         | Short responses | Long responses          | Chat applications       |
| **Message History**  | Not tracked     | Not tracked             | Auto-tracked            |
| **Async/Sync**       | Async (waits)   | Async (streams)         | Async (streams)         |

## Detailed Comparison

### 1. generateText

#### Purpose

Synchronous text generation that waits for the complete response before returning it to the user.

#### Flow

```
User Input → API Request → Model Processing → Complete Response → Display
```

#### Implementation

**Frontend (useCompletion alternative):**

```typescript
"use client";
import { useState } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      setCompletion(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  return (
    <div>
      <form onSubmit={complete}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Send"}
        </button>
      </form>
      {completion && <p>{completion}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

**Backend:**

```typescript
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
  });

  return Response.json({ text });
}
```

#### Characteristics

- **Blocking**: Frontend waits for entire response
- **Simple**: Minimal code and logic
- **No Streaming**: Single response object
- **Easy Error Handling**: Standard try-catch

#### Use Cases

- Short Q&A responses (< 100 tokens)
- When you need complete text for processing
- Simple applications without streaming needs
- API responses that need full context

#### Pros

✅ Simple to implement and understand
✅ Complete response guaranteed
✅ Easy error handling
✅ No streaming complexity
✅ Works with simple fetch API

#### Cons

❌ Poor UX for long responses
❌ User waits for entire response
❌ No progressive feedback
❌ Higher perceived latency
❌ Cannot stop mid-generation

---

### 2. streamText

#### Purpose

Progressive text generation that streams tokens as they're generated, providing real-time feedback.

#### Flow

```
User Input → API Request → Model Processing → Token Stream → Progressive Display
                ↑                                    ↓
                └─────── Real-time Updates ────────┘
```

#### Implementation

**Frontend (useCompletion hook):**

```typescript
"use client";
import { useCompletion } from "@ai-sdk/react";

export default function StreamPage() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useCompletion({
    api: "/api/stream",
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input_value = input;
    setInput("");
    handleSubmit(e);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <button type="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
      <p>{completion}</p>
      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </div>
  );
}
```

**Backend:**

```typescript
import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
  });

  return result.toUIMessageStreamResponse();
}
```

#### Characteristics

- **Streaming**: Sends tokens progressively
- **Real-time**: User sees response appearing
- **Interruptible**: Can stop mid-generation
- **Manual State**: Need to manage input clearing
- **Uses SSE**: Server-Sent Events protocol

#### Use Cases

- Long-form content generation
- Chat-like interfaces
- Real-time AI responses
- When user experience is critical
- Modern AI applications (ChatGPT-style)

#### Pros

✅ Excellent user experience
✅ Lower perceived latency
✅ Can stop generation early (saves costs)
✅ Better for long responses
✅ More engaging
✅ Real-time feedback

#### Cons

❌ More complex implementation
❌ Requires streaming infrastructure
❌ Harder to debug
❌ Need to handle partial responses
❌ More network overhead
❌ Manual input field management

---

### 3. useChat

#### Purpose

High-level chat hook that manages messages and conversation history with built-in streaming support.

#### Flow

```
User Message → Message Array Updates → API Request → Stream Response → Auto-update Messages
     ↑                                                                          ↓
     └─────────── Automatic State Management ─────────────────────────────────┘
```

#### Implementation

**Frontend:**

```typescript
"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error.message}</div>}

      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role === "user" ? "You:" : "AI:"}</strong>
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return <p key={`${message.id}-${index}`}>{part.text}</p>;
            }
          })}
        </div>
      ))}

      {(status === "submitted" || status === "streaming") && (
        <div>Loading...</div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        {status === "submitted" || status === "streaming" ? (
          <button type="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={status !== "ready"}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
```

**Backend:**

```typescript
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error:", error);
    return new Response("Failed", { status: 500 });
  }
}
```

#### Characteristics

- **Full Abstraction**: Handles everything automatically
- **Message Tracking**: Auto-manages conversation history
- **Streaming Built-in**: Uses streaming by default
- **Status Management**: Provides ready/submitted/streaming states
- **Error Handling**: Built-in error state

#### Use Cases

- Chat applications
- Conversational AI
- Multi-turn conversations
- When you need full message history
- Building ChatGPT-like interfaces

#### Pros

✅ Fully automated state management
✅ Message history tracked automatically
✅ Clean, simple API
✅ Built-in error handling
✅ Perfect for chat interfaces
✅ Streaming by default
✅ Stop functionality included

#### Cons

❌ Most abstracted (less control)
❌ Requires API endpoint that accepts message arrays
❌ Fixed format (might not fit all use cases)
❌ Uses custom transport configuration

---

## Comparison by Scenario

### Scenario 1: Simple Q&A Application

**Best Choice**: `generateText`

```
User asks: "What is the capital of France?"
Expected: Single complete answer
Pattern: generateText is perfect - simple, direct, no overhead
```

### Scenario 2: Code Generation Tool

**Best Choice**: `streamText`

```
User asks: "Generate a React component for..."
Expected: Long code snippet, user wants to see it appearing
Pattern: streamText provides real-time feedback, shows code as it generates
```

### Scenario 3: ChatBot / Conversational AI

**Best Choice**: `useChat`

```
User 1: "Hello"
AI 1: "Hi there!"
User 2: "How are you?"
AI 2: "I'm doing well, thanks for asking!"
Pattern: useChat tracks full conversation history automatically
```

### Scenario 4: Content Generation with Stopping

**Best Choice**: `streamText` or `useChat`

```
User asks: "Write a 1000-word essay..."
User after 500 words: "Stop, that's enough"
Pattern: Both support stopping, useChat if you need history, streamText if simple one-off
```

### Scenario 5: Mobile App with Limited Data

**Best Choice**: `generateText`

```
User on slow connection asks for short answer
Pattern: generateText uses less network overhead, single response
```

## State Management Comparison

### generateText

```typescript
// Manual state management
const [completion, setCompletion] = useState("");
const [isLoading, setIsLoading] = useState(false);
// You manage everything
```

### streamText

```typescript
// Partial automation via useCompletion
const { completion, isLoading, input, handleInputChange } = useCompletion();
// Hook manages streaming, you manage input clearing
```

### useChat

```typescript
// Full automation
const { messages, sendMessage, status, error, stop } = useChat();
// Hook manages everything including message history
```

## Network Overhead Comparison

### generateText

```
Request: 1 POST request
Response: 1 complete response
Overhead: Minimal
Total time: T (wait for complete response)
```

### streamText

```
Request: 1 POST request + streaming connection
Response: Multiple chunked responses (N chunks)
Overhead: Moderate (connection setup)
Total time: T (but user sees incremental updates)
```

### useChat

```
Request: 1 POST request + streaming connection
Response: Multiple chunked responses (N chunks)
Overhead: Moderate (same as streamText)
Total time: T (but maintains message history)
```

## API Endpoint Requirements

### generateText

```typescript
// Simple endpoint
POST / api / completion;
Body: {
  prompt: "user's question";
}
Response: {
  text: "complete response";
}
```

### streamText

```typescript
// Streaming endpoint
POST /api/stream
Body: { prompt: "user's question" }
Response: Server-Sent Events stream
```

### useChat

```typescript
// Chat endpoint with message array
POST /api/chat
Body: { messages: [{ role, content }, ...] }
Response: Server-Sent Events stream
```

## Decision Tree

```
┌─ Is it a chat application? ──→ YES → Use useChat
│                                ↓
└─ Is it a short Q&A?  ────→ YES → Use generateText
   ↓
   Is user experience critical?
   ↓
   ├─ YES → Use streamText
   └─ NO → Use generateText
```

## Feature Matrix

| Feature             | generateText | streamText | useChat  |
| ------------------- | ------------ | ---------- | -------- |
| Single Response     | ✅           | ❌         | ❌       |
| Streaming           | ❌           | ✅         | ✅       |
| Stop Mid-Generation | ❌           | ✅         | ✅       |
| Message History     | ❌           | ❌         | ✅       |
| Automatic State     | ❌           | Partial    | ✅       |
| Error Handling      | Manual       | Manual     | Built-in |
| Short Responses     | ✅✅✅       | ✅         | ✅       |
| Long Responses      | ✅           | ✅✅✅     | ✅✅✅   |
| Chat Interface      | ❌           | ❌         | ✅✅✅   |
| Real-time Feedback  | ❌           | ✅✅       | ✅✅     |

## Summary

- **Choose generateText** when you need simplicity for short responses
- **Choose streamText** when you want real-time feedback for single-turn interactions
- **Choose useChat** when building chat applications with message history

Each pattern has its place in the AI SDK ecosystem. Understanding the differences helps you choose the right tool for your specific use case.

## See Also

- [generateText Documentation](./generateText-flow.md)
- [streamText Documentation](./streamText-flow.md)
- [useChat Documentation](./useChat.md)
- [System Prompt Guide](./system-prompt.md)
