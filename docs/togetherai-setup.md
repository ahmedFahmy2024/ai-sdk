# Together.ai Setup for Free Image Generation

## 1. Get Your API Key

1. Go to [Together.ai](https://api.together.ai/)
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the key

## 2. Add to .env.local

Add this line to your `e:\learning\ai-sdk\.env.local` file:

```env
TOGETHER_API_KEY="your-together-ai-api-key-here"
```

## 3. Model Details

**Model**: `black-forest-labs/FLUX.1-schnell-Free`
- ✅ **FREE** tier
- ✅ High quality images
- ✅ Fast generation (schnell means "fast" in German)
- ✅ Supports: 512x512, 768x768, 1024x1024

## 4. Install Package

Run this command (already in progress):
```bash
pnpm add @ai-sdk/togetherai
```

## 5. Test

Once you've added the API key:
1. Restart your dev server (`npm run dev`)
2. Go to `/ui/generate-image`
3. Try a prompt like "A serene mountain landscape at sunrise"

## Free Tier Limits

Together.ai free tier typically includes:
- Limited requests per day
- May have rate limiting
- Good for testing and development

For production, consider upgrading to their paid tier.
