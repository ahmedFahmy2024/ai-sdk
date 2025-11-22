# How streamText Works

## Overview

`streamText` is a streaming AI text generation function from the Vercel AI SDK that sends tokens progressively as they're generated, providing real-time feedback to users.

## Flow Diagram

```
User Input → Frontend → API Route → AI Model → Token Stream → Progressive Display
                ↑                                      ↓
                └──────── Real-time Updates ──────────┘
```

## Detailed Flow

### 1. Frontend (`src/app/ui/stream/page.tsx`)

**Using the `useCompletion` Hook:**

```typescript
const {
  completion, // Accumulated text (updates in real-time)
  input, // Current input value
  handleInputChange, // Updates input state
  handleSubmit, // Sends request and manages streaming
  isLoading, // Loading state
  error, // Error object
  stop, // Function to stop streaming
  setInput, // Manually set input value
} = useCompletion({
  api: "/api/stream", // API endpoint
});
```

**How It Works:**

1. User types in input field
2. User clicks "Send"
3. `handleSubmit()` automatically:
   - Sends POST request to `/api/stream`
   - Sets `isLoading = true`
   - Starts listening to the stream
4. As tokens arrive, `completion` updates progressively
5. UI re-renders with each new token
6. When complete, `isLoading = false`

**Progressive Display:**

```
Time 0s:   ""
Time 0.1s: "AI"
Time 0.2s: "AI is"
Time 0.3s: "AI is artificial"
Time 0.4s: "AI is artificial intelligence"
Time 0.5s: "AI is artificial intelligence..."
```

**Stop Functionality:**

- User can click "Stop" button during generation
- Calls `stop()` function
- Aborts the stream immediately
- Keeps partial response

### 2. Backend API Route (`src/app/api/stream/route.ts`)

**Request Handling:**

```typescript
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
  });

  return result.toUIMessageStreamResponse(); // Returns streaming response
}
```

**Key Characteristics:**

- **Asynchronous**: Sends tokens as they're generated
- **Streaming Response**: Uses Server-Sent Events (SSE) or similar protocol
- **Non-blocking**: Frontend receives updates progressively
- **Interruptible**: Can be stopped mid-generation

### 3. Streaming Protocol

**Response Format:**
The `toUIMessageStreamResponse()` method creates a streaming response that the `useCompletion` hook understands:

```
data: {"type":"text","value":"AI"}
data: {"type":"text","value":" is"}
data: {"type":"text","value":" artificial"}
data: {"type":"text","value":" intelligence"}
data: {"type":"done"}
```

**Frontend Processing:**

- `useCompletion` hook automatically parses the stream
- Accumulates tokens into the `completion` state
- Triggers re-renders for each update
- Handles connection errors and retries

## Timeline Example

```
Time 0.0s:  User submits "What is AI?"
Time 0.0s:  Frontend shows "Loading..."
Time 0.0s:  API receives request
Time 0.0s:  streamText() starts processing
Time 0.1s:  First token arrives: "AI"
Time 0.1s:  Frontend displays: "AI"
Time 0.2s:  Next token: " is"
Time 0.2s:  Frontend displays: "AI is"
Time 0.3s:  Next token: " artificial"
Time 0.3s:  Frontend displays: "AI is artificial"
...
Time 2.0s:  Final token arrives
Time 2.0s:  Stream closes
Time 2.0s:  Loading indicator disappears
```

## Pros and Cons

### Pros:

- Excellent UX - users see immediate feedback
- Lower perceived latency
- Can stop generation early (saves tokens/cost)
- Better for long responses
- More engaging user experience

### Cons:

- More complex implementation
- Requires streaming infrastructure
- Harder to debug
- Need to handle partial responses
- More network overhead

## Technical Details

### How `useCompletion` Works Internally:

1. **Request Phase:**

   - Sends POST request with `{ prompt: "..." }`
   - Sets up streaming connection

2. **Streaming Phase:**

   - Listens to Server-Sent Events (SSE)
   - Parses incoming data chunks
   - Accumulates text in `completion` state
   - Triggers React re-renders

3. **Completion Phase:**
   - Detects stream end
   - Sets `isLoading = false`
   - Cleans up connection

### Temporary Fix in Code:

```typescript
setInput(""); // Clears input before handleSubmit
handleSubmit(e);
```

This is needed because `useCompletion` doesn't automatically clear the input after submission.

## Use Cases

Best for:

- Long-form content generation
- Chat applications
- Real-time AI responses
- When user experience is critical
- Applications where users might want to stop generation
- Modern AI interfaces (ChatGPT-style)

## Comparison with generateText

| Feature         | generateText    | streamText     |
| --------------- | --------------- | -------------- |
| Response Type   | Complete        | Progressive    |
| User Feedback   | Delayed         | Immediate      |
| Perceived Speed | Slower          | Faster         |
| Implementation  | Simple          | Complex        |
| Can Stop Early  | No              | Yes            |
| Best For        | Short responses | Long responses |
