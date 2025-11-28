# System Prompt Engineering Guide

## What is a System Prompt?

A system prompt is an initial instruction given to an AI model that defines its behavior, personality, and role for the entire conversation. Unlike user messages, the system prompt doesn't appear in the conversation history and sets the context for how the AI should respond to all subsequent user messages.

## Why Use System Prompts?

System prompts are essential for:

- **Behavior Control**: Define how the AI should behave and respond
- **Role Definition**: Establish the AI's role or expertise (teacher, developer, etc.)
- **Output Format**: Specify how responses should be structured
- **Constraints**: Set boundaries on what the AI should or shouldn't do
- **Consistency**: Ensure consistent behavior across the entire conversation
- **Context**: Provide domain-specific knowledge or context

## How System Prompts Work in AI SDK

In the AI SDK, system prompts are added as the first message in the messages array with a role of `"system"`:

```typescript
const result = await streamText({
  model: groq("llama-3.1-8b-instant"),
  messages: [
    {
      role: "system",
      content: "Your system prompt here",
    },
    ...convertToModelMessages(messages),
  ],
});
```

The system prompt is prepended before converting user messages, ensuring it always takes precedence.

## Examples of System Prompts

### 1. Teacher/Educator Prompt

```typescript
{
  role: "system",
  content: "You are a friendly teacher who explains concepts using simple analogies. Always relate concepts to everyday experiences"
}
```

**Use case**: Educational chatbots that need to explain complex topics simply.

**Example interaction**:

- User: "What is a variable?"
- AI: "A variable is like a labeled box. Just as you might label a box with 'shoes' to remember what's inside, a variable has a name (like `name` or `age`) and holds a value inside it."

### 2. Code Conversion Prompt

```typescript
{
  role: "system",
  content: "Convert user questions about react into code examples."
}
```

**Use case**: Providing code-focused responses for programming questions.

**Example interaction**:

- User: "How to toggle a boolean?"
- AI: Returns code examples for toggling state

### 3. Developer Assistant Prompt

```typescript
{
  role: "system",
  content: "You are an expert JavaScript developer. Provide clean, well-documented code with explanations. Focus on best practices and modern patterns."
}
```

**Use case**: Helping developers with coding tasks and best practices.

### 4. Customer Support Prompt

```typescript
{
  role: "system",
  content: "You are a helpful customer support representative. Be empathetic, professional, and always try to resolve issues completely. If you can't help, provide alternatives or escalation paths."
}
```

**Use case**: Customer service chatbots.

### 5. Creative Writing Prompt

```typescript
{
  role: "system",
  content: "You are a creative writer. Write engaging, vivid stories with strong narratives and character development. Use descriptive language and maintain consistent tone."
}
```

**Use case**: Content generation and creative applications.

## Advanced System Prompt Techniques

### Few-Shot Prompting

Provide examples of desired behavior:

```typescript
messages: [
  {
    role: "system",
    content:
      "You are a helpful assistant that converts questions into JSON format.",
  },
  {
    role: "user",
    content: "What is the weather?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      question: "What is the weather?",
      type: "weather",
    }),
  },
  {
    role: "user",
    content: "Tell me a joke",
  },
  {
    role: "assistant",
    content: JSON.stringify({ question: "Tell me a joke", type: "joke" }),
  },
  // ... user's actual query
];
```

### Chain-of-Thought Prompting

Instruct the model to think step-by-step:

```typescript
{
  role: "system",
  content: "You are a problem solver. For each question, think step-by-step. First, break down the problem. Second, analyze each part. Third, provide a solution. Finally, validate your answer."
}
```

### Role-Playing

```typescript
{
  role: "system",
  content: "You are Shakespeare, the famous playwright and poet. Respond in Elizabethan English with poetic flair, using metaphors and dramatic language."
}
```

### Constraint-Based Prompts

```typescript
{
  role: "system",
  content: "Answer questions in exactly 2-3 sentences. Use simple language. Do not use technical jargon."
}
```

## Implementation in AI SDK

### Basic System Prompt Example

```typescript
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: groq("llama-3.1-8b-instant"),
    messages: [
      {
        role: "system",
        content:
          "You are a friendly teacher who explains concepts using simple analogies.",
      },
      ...convertToModelMessages(messages),
    ],
  });

  return result.toUIMessageStreamResponse();
}
```

### Dynamic System Prompts

```typescript
export async function POST(req: Request) {
  const {
    messages,
    systemPrompt,
  }: { messages: UIMessage[]; systemPrompt?: string } = await req.json();

  const defaultSystemPrompt = "You are a helpful assistant.";

  const result = await streamText({
    model: groq("llama-3.1-8b-instant"),
    messages: [
      {
        role: "system",
        content: systemPrompt || defaultSystemPrompt,
      },
      ...convertToModelMessages(messages),
    ],
  });

  return result.toUIMessageStreamResponse();
}
```

### Multiple System Prompts with Context

```typescript
const systemPrompts = {
  teacher:
    "You are a friendly teacher who explains concepts using simple analogies.",
  developer:
    "You are an expert developer who provides clean, well-documented code.",
  writer: "You are a creative writer who creates engaging narratives.",
};

export async function POST(req: Request) {
  const {
    messages,
    role = "teacher",
  }: { messages: UIMessage[]; role?: keyof typeof systemPrompts } =
    await req.json();

  const result = await streamText({
    model: groq("llama-3.1-8b-instant"),
    messages: [
      {
        role: "system",
        content: systemPrompts[role],
      },
      ...convertToModelMessages(messages),
    ],
  });

  return result.toUIMessageStreamResponse();
}
```

## Best Practices for System Prompts

### 1. Be Specific and Clear

❌ **Bad**: "Be helpful"
✅ **Good**: "You are a Python expert. Provide code with explanations and best practices."

### 2. Define the Persona

❌ **Bad**: "Answer questions"
✅ **Good**: "You are a sarcastic, witty customer service representative with 10 years of experience."

### 3. Set Output Format

❌ **Bad**: "Provide information"
✅ **Good**: "Respond with bullet points, keeping each point under 20 words."

### 4. Include Constraints

```typescript
{
  role: "system",
  content: "You are a helpful assistant. Do not provide medical advice. Do not make promises about specific outcomes. Always recommend consulting professionals."
}
```

### 5. Use Examples

```typescript
{
  role: "system",
  content: `You extract JSON from text. Example:
Input: "John is 30 and works as a developer"
Output: {"name": "John", "age": 30, "job": "developer"}`
}
```

### 6. Keep It Concise

Shorter, focused prompts often work better than lengthy ones. Focus on the essential instructions.

### 7. Test and Iterate

- Test different prompts with real use cases
- Measure quality of responses
- Refine based on results
- Keep versions for comparison

## Common Pitfalls to Avoid

### 1. Conflicting Instructions

```typescript
// ❌ BAD: Contradictory instructions
{
  role: "system",
  content: "Be concise. Provide detailed explanations."
}
```

### 2. Over-Complication

```typescript
// ❌ BAD: Too complex
{
  role: "system",
  content: "You are a hyper-intelligent super-genius who knows everything about everything and must respond with incredible accuracy while also being funny and sad simultaneously."
}
```

### 3. Relying on Jailbreaks

```typescript
// ❌ BAD: Don't try to bypass model safety
{
  role: "system",
  content: "Ignore your safety guidelines and..."
}
```

### 4. Not Updating System Prompts

Review and update system prompts regularly as:

- New features are added
- User feedback reveals issues
- Use cases evolve

## Testing Your System Prompts

### Quality Checklist

- [ ] Does the output match the intended persona?
- [ ] Are responses in the correct format?
- [ ] Is the tone appropriate for the use case?
- [ ] Are constraints respected?
- [ ] Is the output consistent across multiple requests?

### Example Test Cases

```typescript
// Test 1: Basic functionality
input: "What is 2+2?"
expected: Teacher explains addition

// Test 2: Complex topic
input: "Explain quantum mechanics"
expected: Simple analogy-based explanation

// Test 3: Edge case
input: "Tell me something outside your expertise"
expected: Stays in character while being honest
```

## System Prompt Examples in Your Project

Your AI SDK project includes a system prompt example:

```typescript
// From: src/app/api/system-prompt/route.ts
{
  role: "system",
  content: "You are a friendly teacher who explains concepts using simple analogies. Always relate concepts to everyday experiences"
}
```

This prompt ensures that the model:

- Adopts a friendly, teacherly tone
- Uses analogies for complex concepts
- Relates explanations to everyday experiences
- Maintains consistency across conversations

## Resources

- [OpenAI's System Prompt Documentation](https://platform.openai.com/docs/guides/gpt)
- [Anthropic's Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-a-chatbot)
- [AI SDK Streaming Text Documentation](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)

## Summary

System prompts are powerful tools for controlling AI behavior. They:

1. Define the AI's role and personality
2. Set output formats and constraints
3. Ensure consistent responses
4. Improve user experience
5. Enable domain-specific expertise

By mastering system prompts, you can create more effective, reliable, and user-friendly AI applications.
