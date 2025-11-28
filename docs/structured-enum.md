# Structured Enum

## Overview

The Structured Enum feature demonstrates how to generate constrained outputs using enum values. In this example, we use the Groq model to classify text sentiment into one of three predefined categories: positive, negative, or neutral.

## Architecture

### Backend (API Route)

**File:** `src/app/api/structured-enum/route.ts`

The API endpoint uses `generateObject` to return an enum value:

```typescript
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const result = await generateObject({
      model: groq("moonshotai/kimi-k2-instruct-0905"),
      output: "enum", // Specify that we want an enum output
      enum: ["positive", "negative", "neutral"], // Define the enum values
      prompt: `Classify the sentiment in this text: "${text}`,
    });

    return result.toJsonResponse(); // Changed to toJsonResponse
  } catch (error) {
    console.error("Error generating sentiment:", error);
    return new Response("Failed to generate sentiment", { status: 500 });
  }
}
```

**Key Points:**

- Uses `generateObject` (not `streamObject`) since enum output is concise
- `output: "enum"` indicates we want a single enum value
- `enum` array defines the allowed values
- Returns `toJsonResponse()` for JSON response

### Frontend (UI Component)

**File:** `src/app/ui/structured-enum/page.tsx`

The frontend component uses standard React hooks with fetch API:

```typescript
const [text, setText] = useState("");
const [sentiment, setSentiment] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const analyzeSentiment = async (e: React.FormEvent) => {
  e.preventDefault();

  setIsLoading(true);
  setError(null);
  setText("");

  try {
    const response = await fetch("/api/structured-enum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    setSentiment(data);
  } catch (error) {
    setError(error instanceof Error ? error.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};
```

**Features:**

- Text input for sentiment analysis
- Emoji-based visual feedback (😊 for positive, 😞 for negative, 😐 for neutral)
- Loading state during analysis
- Error handling with user-friendly messages
- Loading state management with button disabled state

## How It Works

1. User enters text in the input field
2. Frontend sends text to `/api/structured-enum`
3. Backend uses the model to classify sentiment
4. Model returns one of three enum values
5. Frontend displays the result with corresponding emoji

## Enum Values

The sentiment classification supports three values:

- `positive` - Displays 😊 emoji
- `negative` - Displays 😞 emoji
- `neutral` - Displays 😐 emoji

## Key Differences from Other Patterns

- **vs. Structured Array:** Returns a single enum value instead of an array of objects
- **vs. Structured Data:** Constrains output to predefined values instead of free-form structured objects
- **No Streaming:** Uses `generateObject` (not `streamObject`) since response is atomic

## Use Cases

- Classification tasks (sentiment, category, intent, etc.)
- Status/state determination
- Binary or multi-choice decisions
- Any scenario where output must be one of a fixed set of values

## Benefits of Enums

- **Type Safety:** Output is guaranteed to be one of the defined values
- **Performance:** Model is constrained, leading to faster responses
- **Predictability:** Frontend knows exactly what values to expect
- **Validation:** No need for additional validation logic
