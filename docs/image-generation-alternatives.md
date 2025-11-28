# Image Generation - Free Tier Options

## ⚠️ Issue: Google Gemini Image Generation Quota

**Problem discovered**: `gemini-2.5-flash-image` has a **free tier quota limit of 0**, meaning it requires billing despite being marketed as free tier.

```
Quota exceeded for metric: generate_content_free_tier_input_token_count
limit: 0, model: gemini-2.5-flash-image
```

## 🆓 Free Alternatives

### Option 1: Use Replicate (Free Tier Available)

Replicate offers free tier credits and supports multiple image generation models.

**Installation:**
```bash
pnpm add @ai-sdk/replicate
```

**Setup:**
```env
# Get free API key from https://replicate.com
REPLICATE_API_KEY="your_key_here"
```

**Code:**
```typescript
import { replicate } from '@ai-sdk/replicate';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: replicate.image('black-forest-labs/flux-schnell'),
  prompt: 'A futuristic cityscape at sunset',
});
```

### Option 2: Use Fal.ai (Free Tier Available)

Fal.ai provides free credits for image generation.

**Installation:**
```bash
pnpm add @ai-sdk/fal
```

**Setup:**
```env
# Get API key from https://fal.ai
FAL_API_KEY="your_key_here"
```

**Code:**
```typescript
import { fal } from '@ai-sdk/fal';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: fal.image('fal-ai/flux/dev'),
  prompt: 'A futuristic cityscape at sunset',
});
```

### Option 3: Use OpenAI (Paid, $0.040-$0.120 per image)

Most reliable option but requires payment.

**Installation:**
```bash
pnpm add @ai-sdk/openai
```

**Setup:**
```env
OPENAI_API_KEY="sk-your-key"  # Already in your .env
```

**Code:**
```typescript
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';

const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'A futuristic cityscape at sunset',
  size: '1024x1024',
});
```

## 💡 Recommended: Replicate

Based on cost and availability, I recommend **Replicate** with the `flux-schnell` model:
- ✅ Free tier available
- ✅ Fast generation
- ✅ Good quality images
- ✅ Easy integration

## Next Steps

Choose one of the options above and let me know which provider you'd like to use. I'll update your code accordingly.
