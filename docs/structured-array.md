# Structured Array

## Overview

The Structured Array feature demonstrates how to generate and stream arrays of structured objects using the Vercel AI SDK. In this example, we use the Groq model to generate a list of Pokémon with their abilities.

## Architecture

### Backend (API Route)

**File:** `src/app/api/structured-array/route.ts`

The API endpoint uses `streamObject` to generate an array of Pokémon:

```typescript
export async function POST(request: Request) {
  try {
    const { type } = await request.json();

    const result = streamObject({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      output: "array", // Specify that we want an array output
      schema: pokemonSchema, // we pass single pokemon schema not array
      prompt: `Generate a List of 5 ${type} Pokemon.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating structured data:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
```

**Key Points:**

- Uses `streamObject` for streaming responses
- `output: "array"` indicates we want an array of objects
- Pass the single object schema (not wrapped in an array) - the SDK handles array wrapping
- Returns `toTextStreamResponse()` for streaming

### Schema

**File:** `src/app/api/structured-array/schema.ts`

```typescript
import { array, z } from "zod";

export const pokemonSchema = z.object({
  name: z.string(),
  abilities: z.array(z.string()),
});

export const pokemonUISchema = z.array(pokemonSchema);
```

**Schema Definition:**

- `pokemonSchema`: Defines a single Pokémon object with name and abilities
- `pokemonUISchema`: Wraps the schema in an array for UI consumption

### Frontend (UI Component)

**File:** `src/app/ui/structured-array/page.tsx`

The frontend component uses `useObject` hook from `@ai-sdk/react`:

```typescript
const { object, submit, isLoading, error, stop } = useObject({
  api: "/api/structured-array",
  schema: pokemonUISchema,
});
```

**Features:**

- Real-time streaming of Pokémon data
- Displays each Pokémon with its abilities in a card layout
- Loading and error states
- Stop button to cancel ongoing requests
- Form input for selecting Pokémon type (e.g., "fire", "water")

## How It Works

1. User enters a Pokémon type in the input field
2. Frontend calls `/api/structured-array` with the type
3. Backend streams an array of 5 Pokémon of that type
4. Frontend receives each object as it's streamed and displays it immediately
5. User can see results update in real-time as the model generates them

## Key Differences from Other Patterns

- **vs. Structured Data:** Generates multiple objects instead of a single object
- **vs. Structured Enum:** Returns complex objects instead of enum values
- **Streaming:** Uses `streamObject` for real-time data (not `generateObject`)

## Use Cases

- Generating lists of items with consistent structure
- Batch data processing
- Creating collections of related objects
- Any scenario requiring an array of structured data
