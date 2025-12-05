import { google } from "@ai-sdk/google";
import { openai as originalOpenAI } from "@ai-sdk/openai";
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";

const customOpenAI = customProvider({
  languageModels: {
    fast: originalOpenAI("gpt-5-nano"),
    smart: originalOpenAI("gpt-5-mini"),
    reasoning: wrapLanguageModel({
      model: originalOpenAI("gpt-5-mini"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "high",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalOpenAI,
});

const customGoogle = customProvider({
  languageModels: {
    fast: google("gemini-2.5-flash"),
    smart: google("gemini-3-pro-preview"),
  },
  fallbackProvider: google,
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
  google: customGoogle,
});
