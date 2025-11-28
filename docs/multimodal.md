# Multimodal Chat

Multimodal chat allows you to send both text and media files (images, PDFs) to AI models. This enables richer interactions where the AI can analyze visual content alongside text prompts.

## Overview

The multimodal chat feature leverages the AI SDK's `streamText` function with Google's Gemini model to process and respond to messages containing:

- Text content
- Images (JPG, JPEG, PNG, WebP)
- PDF documents

## Implementation

### Backend API

The API endpoint at `/api/multi-modal-chat` handles incoming requests with messages that may contain both text and files:

```typescript
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

**Key Components:**

- `streamText`: Streams AI responses in real-time
- `google("gemini-2.5-flash")`: Uses Google's Gemini 2.5 Flash model
- `convertToModelMessages`: Transforms UI messages into model-compatible format
- `toUIMessageStreamResponse`: Returns a streamed response ready for the frontend

### Frontend Component

The React component provides a user interface for multimodal interactions:

**Features:**

- **File Upload**: Users can attach multiple files (images and PDFs)
- **Real-time Streaming**: Messages stream as they're generated
- **Media Display**:
  - Images render using Next.js `Image` component
  - PDFs display in an embedded iframe
- **Status Tracking**: Shows loading state and error messages
- **Stream Control**: Stop button to interrupt ongoing requests

```typescript
const { messages, sendMessage, status, error, stop } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/multi-modal-chat",
  }),
});
```

## File Support

Supported file formats for multimodal chat:

- **Images**: JPG, JPEG, PNG, WebP
- **Documents**: PDF

Files are selected via file input and sent with the text message.

## Usage

1. Enter text in the input field
2. Click the attachment icon to select one or more files
3. Click "Send" to submit the message with media
4. The AI will analyze the content and respond
5. View the response with any embedded media rendered appropriately

## Error Handling

The implementation includes error handling at both API and frontend levels:

- API errors return a 500 status with an error message
- Frontend displays error messages to the user
- Console logs capture detailed error information

## Technical Details

- **Streaming**: Responses are streamed for faster perceived performance
- **Message Conversion**: UIMessage format is converted to model-compatible format for processing
- **Media Type Detection**: Automatically determines how to render content based on MIME type
- **File Management**: File input is cleared after submission for a clean UX
