# AI SDK with Google for Image Generation - Complete Guide

## Overview

Google offers **two different approaches** for image generation with the AI SDK:

1. **Gemini Models with Image Outputs** - Language models that can generate images (free tier supported)
2. **Imagen Models** - Dedicated image generation models (requires billing)

## Table of Contents

- [Setup](#setup)
- [Approach 1: Gemini Models (Recommended for Free Tier)](#approach-1-gemini-models-recommended-for-free-tier)
- [Approach 2: Imagen Models (Requires Billing)](#approach-2-imagen-models-requires-billing)
- [Key Differences](#key-differences)
- [Best Practices](#best-practices)

---

## Setup

### Installation

```bash
pnpm add @ai-sdk/google ai
```

### Environment Variables

Create a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Import the Provider

```typescript
import { google } from '@ai-sdk/google';
```

---

## Approach 1: Gemini Models (Recommended for Free Tier)

### Available Models

- **`gemini-2.5-flash-image`** (aka "Nano Banana") - Fast, efficient, 1024px resolution
- **`gemini-2.5-flash-image-preview`** - Preview version with latest features
- **`gemini-3-pro-image-preview`** (aka "Nano Banana Pro") - Professional quality, up to 4K

### Basic Usage

```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-2.5-flash-image'),
  prompt: 'Create a picture of a futuristic cityscape at sunset',
});

// Access generated images from the files property
for (const file of result.files) {
  if (file.mediaType?.startsWith('image/')) {
    console.log('Image generated!');
    
    // Access image data
    const base64 = file.base64;        // data:image/png;base64,<data>
    const binary = file.uint8Array;    // Uint8Array binary data
    const mimeType = file.mediaType;   // e.g., "image/png"
  }
}
```

### Next.js API Route Example

```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await generateText({
      model: google('gemini-2.5-flash-image'),
      prompt,
    });

    // Find the first image
    const imageFile = result.files?.find((file) => 
      file.mediaType?.startsWith('image/')
    );

    if (!imageFile) {
      return new Response('No image generated', { status: 500 });
    }

    // Extract base64 (remove data URL prefix if needed)
    const base64 = imageFile.base64.split(',')[1];
    
    return Response.json({ base64 });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
```

### Gemini 3 Pro Image Features

The `gemini-3-pro-image-preview` model offers advanced capabilities:

- **High-resolution output**: 1K, 2K, and 4K generation
- **Advanced text rendering**: Legible text in images (infographics, menus, diagrams)
- **Google Search grounding**: Real-time data integration (weather maps, stock charts, events)
- **Thinking mode**: Refines composition before final generation
- **Multiple reference images**: Up to 14 reference images for composition

---

## Approach 2: Imagen Models (Requires Billing)

> ⚠️ **Important**: Imagen models are **only accessible to billed users**. You'll get a 400 error if you try to use them without a billing account.

### Available Models

- **`imagen-3.0-generate-002`** - Latest Imagen 3 model
- **`imagen-3.0-generate-001`** - Previous Imagen 3 version
- **`imagen-3.0-fast-generate-001`** - Fast generation variant
- **`imagen-4.0-generate-001`** - Imagen 4 (latest)
- **`imagen-4.0-generate-preview-06-06`** - Imagen 4 preview
- **`imagen-4.0-ultra-generate-preview-06-06`** - Ultra quality

### Basic Usage

```typescript
import { google } from '@ai-sdk/google';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: google.image('imagen-3.0-generate-002'),
  prompt: 'A futuristic cityscape at sunset',
  aspectRatio: '16:9',  // Note: Use aspectRatio, not size
});

// Access image data
const base64 = image.base64;        // base64 string
const binary = image.uint8Array;    // Uint8Array binary data
```

### Provider Options

```typescript
import { google } from '@ai-sdk/google';
import { GoogleGenerativeAIImageProviderOptions } from '@ai-sdk/google';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: google.image('imagen-3.0-generate-002'),
  prompt: 'A portrait of a person',
  aspectRatio: '1:1',
  providerOptions: {
    google: {
      personGeneration: 'allow_adult', // 'allow_adult' | 'allow_all' | 'dont_allow'
    } satisfies GoogleGenerativeAIImageProviderOptions,
  },
});
```

### Important Notes

- **Use `aspectRatio` instead of `size`** - Imagen models don't support the `size` parameter
- **Requires billing** - You must have a Google Cloud billing account
- **Use `google.image()` not `google()`** - Imagen requires the `.image()` factory method

---

## Key Differences

| Feature | Gemini Models | Imagen Models |
|---------|---------------|---------------|
| **Billing Required** | ❌ No (Free tier) | ✅ Yes |
| **Function** | `generateText()` | `experimental_generateImage()` |
| **Model Creation** | `google('model-name')` | `google.image('model-name')` |
| **Image Access** | `result.files` array | `image.base64` / `image.uint8Array` |
| **Max Resolution** | Up to 4K (Gemini 3 Pro) | Variable |
| **Size Parameter** | N/A | Use `aspectRatio` instead |
| **Text in Images** | ✅ Advanced (Gemini 3 Pro) | Limited |
| **Google Search** | ✅ Yes (Gemini 3 Pro) | ❌ No |

---

## Best Practices

### 1. Choose the Right Model

- **Free tier / Testing**: Use `gemini-2.5-flash-image`
- **Professional assets**: Use `gemini-3-pro-image-preview` or Imagen models
- **Speed priority**: Use `gemini-2.5-flash-image` or `imagen-3.0-fast-generate-001`
- **Quality priority**: Use `gemini-3-pro-image-preview` or `imagen-4.0-ultra-generate-preview-06-06`

### 2. Handle Errors Properly

```typescript
try {
  const result = await generateText({
    model: google('gemini-2.5-flash-image'),
    prompt: userPrompt,
  });
  
  if (!result.files || result.files.length === 0) {
    throw new Error('No images generated');
  }
} catch (error) {
  if (error instanceof Error) {
    // Check for billing error
    if (error.message.includes('billed users')) {
      console.error('Imagen requires a billed account');
    }
    // Check for model not found
    if (error.message.includes('not found')) {
      console.error('Invalid model name');
    }
  }
}
```

### 3. Accessing Base64 Data

Gemini models return base64 with the data URL prefix, so you may need to strip it:

```typescript
// Gemini models
const imageFile = result.files[0];
const base64WithPrefix = imageFile.base64; // "data:image/png;base64,iVBOR..."
const base64Only = imageFile.base64.split(',')[1]; // "iVBOR..."

// Imagen models
const base64 = image.base64; // Already without prefix
```

### 4. Client-Side Display

```typescript
// For Gemini (with prefix)
<img src={imageFile.base64} alt="Generated" />

// For Imagen or stripped base64
<img src={`data:image/png;base64,${base64}`} alt="Generated" />
```

### 5. Debugging Available Models

If you're unsure which models are available to your API key:

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
);
const data = await response.json();
const modelNames = data.models.map((m: any) => m.name);
console.log('Available models:', modelNames);
```

---

## Common Pitfalls

### ❌ Wrong: Using Imagen without billing
```typescript
// This will fail with "billed users only" error
const { image } = await generateImage({
  model: google.image('imagen-3.0-generate-002'),
  prompt: 'A cat',
});
```

### ✅ Correct: Use Gemini for free tier
```typescript
const result = await generateText({
  model: google('gemini-2.5-flash-image'),
  prompt: 'A cat',
});
```

### ❌ Wrong: Accessing Gemini images incorrectly
```typescript
const result = await generateText({
  model: google('gemini-2.5-flash-image'),
  prompt: 'A cat',
});
// This won't work - there's no .image property
const base64 = result.image.base64;
```

### ✅ Correct: Access via files array
```typescript
const imageFile = result.files?.find(f => f.mediaType?.startsWith('image/'));
const base64 = imageFile.base64;
```

### ❌ Wrong: Using size parameter with Imagen
```typescript
const { image } = await generateImage({
  model: google.image('imagen-3.0-generate-002'),
  size: '1024x1024', // Not supported
});
```

### ✅ Correct: Use aspectRatio instead
```typescript
const { image } = await generateImage({
  model: google.image('imagen-3.0-generate-002'),
  aspectRatio: '1:1',
});
```

---

## Summary

**For most developers using Google's free tier**: Use `gemini-2.5-flash-image` with `generateText()` and access images via `result.files`.

**For production with billing**: Consider Imagen models for dedicated image generation, but remember to use `aspectRatio` instead of `size`.

Both approaches are valid—choose based on your billing status and feature requirements!
