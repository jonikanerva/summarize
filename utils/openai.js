/**
 * Utility functions for OpenAI API integration
 */

// The main function to call OpenAI API for summarization
async function summarizeWithOpenAI(apiKey, model, prompt) {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    // Using the user's preferred model (default: gpt-4.1)
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.error?.message ||
        `API request failed with status ${response.status}`;
      throw new Error(`OpenAI API Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Function to validate an OpenAI API key
async function validateApiKey(apiKey) {
  try {
    if (!apiKey) {
      return { valid: false, error: "API key is empty" };
    }

    // Make a minimal request to verify the API key
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 401) {
      return { valid: false, error: "Invalid API key" };
    }

    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error:
          errorData.error?.message ||
          `API request failed with status ${response.status}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Network error when validating API key" };
  }
}

// Export functions if we're in a module context
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    summarizeWithOpenAI,
    validateApiKey,
  };
}
