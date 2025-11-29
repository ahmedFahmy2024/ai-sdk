# WebSearchToolPage

## Overview

`WebSearchToolPage` is a React client component that demonstrates AI-powered web search functionality using the Vercel AI SDK. It integrates with the Google Gemini model and Google's built-in search tool to perform real-time web searches and provide sourced information.

## Location

- **File**: `src/app/ui/web-search-tool/page.tsx`
- **Type**: Client Component (`"use client"`)

## Features

### 1. Chat Interface

- Text-based user input with a submit form
- Displays conversational messages from user and AI
- Real-time streaming of AI responses
- Fixed input form at the bottom of the page

### 2. Web Search Tool Integration

The page integrates with Google's **`google_search`** tool which:

- Performs real-time web searches based on AI-generated queries
- Returns search results with sources
- Provides relevant information to augment AI responses
- Uses the built-in Google tool provided by the AI SDK

### 3. Tool State Display

The component displays different UI states for tool execution:

- **`input-streaming`**: Shows "Preparing to search..." while tool input is being streamed
- **`input-available`**: Displays "Searching the web..." when the search is actively running
- **`output-available`**: Shows "Web search complete" and renders a sources section
- **`output-error`**: Displays error messages if the search fails

### 4. Source Attribution

- Automatically extracts and displays sources from search results
- Shows a badge with the number of sources found
- Each source is a clickable link that opens in a new tab
- Links display the source title (if available) or the URL
- Styled in a blue highlighted box for visual distinction

### 5. Loading States

- Animated spinner displayed while AI is processing or streaming
- Stop button available during active streaming to cancel requests
- Disabled send button during processing to prevent duplicate requests

## Component Structure

```
WebSearchToolPage
├── Chat Setup (useChat hook)
├── Message Display
│   ├── User Messages
│   └── AI Messages with Tool Parts
│       ├── Text responses
│       └── Tool execution states
│           ├── Search progress indicators
│           └── Sources section (with clickable links)
└── Input Form
    ├── Text Input
    ├── Send Button
    └── Stop Button (when streaming)
```

## Key Dependencies

- **`@ai-sdk/react`**: Provides the `useChat` hook for managing conversation state
- **`DefaultChatTransport`**: Handles communication with the `/api/web-search-tool` endpoint
- **Google Gemini Model**: Used for reasoning and search query generation
- **`google.tools.googleSearch`**: Built-in web search tool from the Google AI SDK

## Communication Flow

1. User enters a question in the input field
2. Message is sent via `sendMessage` to the `/api/web-search-tool` endpoint
3. Backend processes the message with Gemini model and web search tool
4. AI decides whether to perform a web search based on the query
5. Web search tool execution states are streamed back to the client:
   - Input streaming → Input available → Output available/Error
6. Search results and sources are extracted from the response
7. Sources are rendered as clickable links in a dedicated section
8. Final AI response incorporates the search results

## Styling

- Uses Tailwind CSS for responsive design
- Dark mode support with `dark:` prefixes
- Blue-themed source section for visual distinction
- Fixed position form at the bottom for persistent input
- Max width constraint for optimal readability
- Responsive layout with flex utilities
- Hover effects on source links for better UX

## Error Handling

- Displays error messages in red text with ❌ emoji when searches fail
- Shows error state in the message thread without breaking the UI
- Maintains chat history even when errors occur
- Gracefully handles cases where no sources are returned

## Source Display Logic

Sources are conditionally displayed only when:

- Message is from the assistant
- At least one source is present in the message parts
- Search has completed successfully (`output-available` state)

## Sources Section Implementation

### Source Extraction

```typescript
const sources = message.parts.filter((part) => part.type === "source-url");
```

Sources are extracted from each message by filtering for parts with type `"source-url"`. This creates an array of all search result sources returned by the web search tool.

### Source Container

The sources are displayed in a dedicated container with:

- **Background**: Light blue in light mode (`bg-blue-50`), darker blue in dark mode (`dark:bg-blue-950/20`)
- **Border**: Blue border with dark mode support (`border-blue-200 dark:border-blue-800`)
- **Padding**: Rounded corners with 3px padding (`rounded-lg p-3`)
- **Spacing**: Consistent spacing between elements

### Source Header

```typescript
<span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
  Sources ({sources.length})
</span>
```

The header displays:

- "Sources" label in blue text
- Count of sources found in parentheses
- Updates dynamically based on the number of results

### Source Links

Each source is rendered as a clickable link with:

- **href**: Points to the source URL
- **target="\_blank"**: Opens in a new tab
- **rel="noopener noreferrer"**: Security attribute to prevent security vulnerabilities
- **title**: Full URL shown on hover for long URLs
- **truncate**: CSS class to prevent text overflow
- **Styling**: Blue text with hover state changes
  - Light mode: `text-blue-600 hover:text-blue-800`
  - Dark mode: `dark:text-blue-400 dark:hover:text-blue-300`
  - Underline decoration for link visibility

### Source Data Structure

Each source part contains:

- **url** (string): The web address of the source
- **title** (optional string): Human-readable title of the source
- **type**: Always `"source-url"` for source parts

The component displays the title if available, otherwise falls back to the URL:

```typescript
{
  part.title || part.url;
}
```

### Source Display Conditions

Sources are only rendered when all of these conditions are met:

```typescript
{
  message.role === "assistant" && sources.length > 0 && (
    <div className="mb-2">{/* Source container */}</div>
  );
}
```

- **Role check**: Only assistant messages can have sources
- **Length check**: Only display if at least one source exists
- **State check**: Implicit - sources only populate after successful search

## Related Files

- **Backend**: `src/app/api/web-search-tool/route.ts` - Handles model interaction with web search tool
- **Similar Feature**: `src/app/ui/api-tool/page.tsx` - Similar implementation with custom weather tool

## Differences from APIToolPage

| Aspect           | APIToolPage               | WebSearchToolPage             |
| ---------------- | ------------------------- | ----------------------------- |
| Tool Type        | Custom tool (getWeather)  | Built-in tool (google_search) |
| Data Format      | Structured JSON (weather) | Web results with sources      |
| Output Component | WeatherCard component     | Inline source links           |
| Use Case         | Specific API calls        | General web information       |
| Source Handling  | N/A                       | Source attribution and links  |
