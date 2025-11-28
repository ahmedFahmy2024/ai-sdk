# streamObject & useObject Documentation

## Overview

`streamObject` and `useObject` are part of the Vercel AI SDK that work together to enable structured data generation from AI models. While `streamText` generates text tokens progressively, `streamObject` generates structured data (JSON objects) progressively, validating them against a Zod schema.

## Flow Diagram

```
User Input → Frontend → API Route → AI Model → Structured Stream → Progressive Display
                ↑                                      ↓
                └──────── Real-time Updates ──────────┘
```

## How It Works

### Backend Flow

#### 1. Define Schema (`src/app/api/structured-data/schema.ts`)

First, define the structure of the data you want to generate using Zod:

```typescript
import { z } from "zod";

export const recipeSchema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.string()),
  }),
});
```

**Schema Components:**

- **Top-level object**: The root structure (in this case `recipe`)
- **Nested objects**: Objects within the main structure (ingredients with name and amount)
- **Arrays**: Collections of items (list of ingredients, list of steps)
- **Validation**: Each field has a type (`string`, `array`, etc.)

#### 2. Backend API Route (`src/app/api/structured-data/route.ts`)

```typescript
import { groq } from "@ai-sdk/groq";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(request: Request) {
  try {
    const { dish } = await request.json();

    const result = streamObject({
      model: groq("llama-3.1-8b-instant"),
      schema: recipeSchema,
      prompt: `Generate a recipe for a dish called ${dish}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating structured data:", error);
    return new Response("Failed to generate recipe", { status: 500 });
  }
}
```

**Key Features:**

- **`streamObject()` function**: Takes a model, schema, and prompt
- **Schema validation**: The AI generates data that matches the schema structure
- **`toTextStreamResponse()`**: Converts the stream to a format the frontend can consume
- **Error handling**: Catches and reports generation failures

### Frontend Flow

#### Using the `useObject` Hook (`src/app/ui/structured-data/page.tsx`)

```typescript
const { submit, object, isLoading, error, stop } = useObject({
  api: "/api/structured-data",
  schema: recipeSchema,
});
```

**Hook Properties:**

| Property    | Type                  | Description                                      |
| ----------- | --------------------- | ------------------------------------------------ |
| `submit`    | `(data: any) => void` | Function to submit a request with data           |
| `object`    | `Partial<T>`          | The progressively updated object being generated |
| `isLoading` | `boolean`             | Whether data is currently being generated        |
| `error`     | `Error \| null`       | Error object if generation failed                |
| `stop`      | `() => void`          | Function to stop the generation process          |

**How It Works:**

1. User enters input (e.g., "Pizza")
2. User submits form
3. `submit({ dish: "Pizza" })` is called
4. Request sent to `/api/structured-data` endpoint
5. `isLoading` becomes `true`
6. AI model generates structured data progressively
7. `object` updates in real-time with partial data
8. As fields complete, they appear in the UI
9. When complete, `isLoading` becomes `false`

**Progressive Generation Timeline:**

```
Time 0s:   { recipe: {} }
Time 0.2s: { recipe: { name: "Pizza" } }
Time 0.4s: { recipe: { name: "Pizza", ingredients: [{ name: "Flour", amount: "2 cups" }] } }
Time 0.6s: { recipe: { name: "Pizza", ingredients: [...], steps: ["Mix ingredients"] } }
...
```

## Example Implementation

### Complete Frontend Component

```typescript
"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { recipeSchema } from "@/app/api/structured-data/schema";

export default function StructuredDataPage() {
  const [dishName, setDishName] = useState("");

  const { submit, object, isLoading, error, stop } = useObject({
    api: "/api/structured-data",
    schema: recipeSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ dish: dishName });
    setDishName("");
  };

  return (
    <div className="flex flex-col w-full max-w-2xl pt-12 pb-24 mx-auto">
      {/* Error Display */}
      {error && <div className="text-red-500 mb-4 px-4">{error.message}</div>}

      {/* Display Generated Object */}
      {object?.recipe && (
        <div className="space-y-6 px-4">
          <h2 className="text-2xl font-bold">{object.recipe.name}</h2>

          {/* Ingredients Section */}
          {object?.recipe?.ingredients && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <div className="grid grid-cols-2 gap-4">
                {object.recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg"
                  >
                    <p className="font-medium">{ingredient?.name}</p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {ingredient?.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps Section */}
          {object?.recipe?.steps && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Steps</h3>
              <ol className="space-y-4">
                {object.recipe.steps.map((step, index) => (
                  <li
                    key={index}
                    className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg"
                  >
                    <span className="font-medium mr-2">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-2xl mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="Enter a dish name..."
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
          />
          {isLoading ? (
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
              disabled={isLoading || !dishName}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Key Differences from streamText

| Feature            | streamText              | streamObject                               |
| ------------------ | ----------------------- | ------------------------------------------ |
| **Output Type**    | Plain text              | Structured JSON object                     |
| **Validation**     | None                    | Schema validation via Zod                  |
| **Frontend Hook**  | `useCompletion`         | `useObject`                                |
| **Use Cases**      | Chat, text generation   | Forms, structured data, APIs               |
| **Data Structure** | String that accumulates | Object that fills progressively            |
| **Partial Data**   | Always valid text       | Partial object (may have undefined fields) |

## Error Handling

The `error` property from `useObject` captures any issues:

```typescript
if (error) {
  console.error("Generation failed:", error.message);
  // Display error to user
}
```

**Common Errors:**

- Schema validation failure (AI output doesn't match schema)
- Network errors
- API rate limits
- Model service errors

## Stop Functionality

Users can stop ongoing generation:

```typescript
{
  isLoading ? (
    <button onClick={stop} className="bg-red-500...">
      Stop
    </button>
  ) : (
    <button onClick={handleSubmit} className="bg-blue-500...">
      Generate
    </button>
  );
}
```

When `stop()` is called:

- Stream is interrupted
- Current partial `object` is retained
- `isLoading` becomes `false`
- User can modify and resubmit

## Best Practices

1. **Schema Design**: Keep schemas focused and nested logically
2. **Type Safety**: Use Zod for both backend and frontend type inference
3. **User Feedback**: Show partial data as it arrives for better UX
4. **Error States**: Always display and handle errors gracefully
5. **Loading States**: Provide clear visual feedback during generation
6. **Optional Fields**: Use `.optional()` in Zod for fields that might not always be generated

## When to Use streamObject

Use `streamObject` when you need:

- ✅ Structured, validated data from AI models
- ✅ Progressive updates as data is generated
- ✅ Form submission with AI-generated data
- ✅ API responses with specific schemas
- ✅ Real-time data that needs validation

Avoid `streamObject` when:

- ❌ Simple text generation (use `streamText`)
- ❌ You don't need structured output
- ❌ Performance is critical (validation adds overhead)
- ❌ Schema is too complex to define
