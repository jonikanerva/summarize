import OpenAI from "openai";

/**
 * Utility functions for OpenAI API integration using the official OpenAI SDK
 */
async function summarizeWithOpenAI(apiKey, model, prompt) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0].message.content.trim();
}

export { summarizeWithOpenAI };
