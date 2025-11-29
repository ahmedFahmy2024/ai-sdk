# APIToolPage

## Overview

`APIToolPage` is a React client component that demonstrates AI-powered tool calling functionality using the Vercel AI SDK. It integrates with the Google Gemini model to fetch real-time weather data through a tool-based API call.

## Location

- **File**: `src/app/ui/api-tool/page.tsx`
- **Type**: Client Component (`"use client"`)

## Features

### 1. Chat Interface

- Text-based user input with a submit form
- Displays messages from both user and AI in a conversational format
- Real-time streaming of AI responses

### 2. Tool Integration

The page integrates with the **`getWeather`** tool which:

- Takes a city name as input
- Fetches current weather data from the WeatherAPI
- Returns formatted weather information including:
  - Location (name, country, local time)
  - Current conditions (temperature in Celsius, condition text, condition code)

### 3. Tool State Display

The component displays different UI states for tool execution:

- **`input-streaming`**: Shows incoming tool request parameters
- **`input-available`**: Displays which city weather is being fetched
- **`output-available`**: Renders the weather data using the `WeatherCard` component
- **`output-error`**: Shows error messages if tool execution fails

### 4. Loading States

- Displays a spinning loader while the AI is processing or streaming
- Stop button available during active streaming to cancel requests

## Component Structure

```
APIToolPage
├── Chat Setup (useChat hook)
├── Message Display
│   ├── User Messages
│   └── AI Messages with Tool Parts
│       ├── Text responses
│       └── Tool execution states
│           └── WeatherCard (for weather output)
└── Input Form
    ├── Text Input
    ├── Send Button
    └── Stop Button (when streaming)
```

## Key Dependencies

- **`@ai-sdk/react`**: Provides the `useChat` hook for managing conversation state
- **`DefaultChatTransport`**: Handles communication with the `/api/api-tool` endpoint
- **`WeatherCard`**: Custom component for rendering weather information with dynamic styling
- **TypeScript**: Uses type inference from the backend route

## Communication Flow

1. User enters a message in the input field
2. Message is sent via `sendMessage` to the `/api/api-tool` endpoint
3. Backend processes the message with Gemini model and tools
4. AI decides whether to use the `getWeather` tool
5. Tool execution states are streamed back to the client
6. Component renders each state appropriately
7. Final AI response is displayed with formatted tool results

## Styling

- Uses Tailwind CSS for responsive design
- Dark mode support with `dark:` prefixes
- Fixed position form at the bottom of the page
- Max width constraint for optimal readability
- Responsive layout with flex utilities

## Error Handling

- Displays error messages in red text when API calls fail
- Shows error state in the message thread without breaking the UI
- Maintains chat history even when errors occur

## Related Files

- **Backend**: `src/app/api/api-tool/route.ts` - Handles model interaction and tool execution
- **Components**: `src/app/ui/api-tool/WeatherCard.tsx` - Displays weather data with theme-based styling
