import { summarizeWithOpenAI } from "./utils/openai.js";

// Background script for managing extension state and API communication

// Default settings
const DEFAULT_SETTINGS = {
  apiKey: "",
  model: "gpt-4.1",
  promptTemplate:
    "Summarize the provided content comprehensively and accurately, ensuring no key details are omitted.\n\nStart by generating a good title for the article stating what the text is about objectively, followed by the byline who is the author(s) of the article and date written.\n\nThen create a bulleted list of the objective facts and key points, followed by a bulleted list of the author’s opinions.\n\nThen write an assessment of whether the article provides sources for its facts, comment on the reliability of those sources, and/or the reputation of the author.\n\nConclude with a one-paragraph summary of the whole article.\n\nStructure your response using proper HTML formatting, using only element <H1>, <H2>, <UL>, <LI>, and <P>.\n\n{{ARTICLE_TEXT}}",
};

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["apiKey", "model", "promptTemplate"], (result) => {
    const settings = {
      apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
      model: result.model || DEFAULT_SETTINGS.model,
      promptTemplate: result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
    };
    chrome.storage.sync.set(settings);
  });
});

// When the extension icon is clicked, automatically summarize the current page
chrome.action.onClicked.addListener((tab) => {
  // First check if API key is set
  chrome.storage.sync.get(["apiKey"], (result) => {
    if (!result.apiKey) {
      // If no API key, open settings page
      chrome.runtime.openOptionsPage
        ? chrome.runtime.openOptionsPage()
        : chrome.tabs.create({ url: "settings.html" });
    } else {
      chrome.tabs.create({
        url: chrome.runtime.getURL(`summary.html?tabId=${tab.id}`),
      });
    }
  });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeArticle") {
    summarizeArticle(request.articleContent)
      .then((summary) => sendResponse({ success: true, summary }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }

  if (request.action === "getSettings") {
    chrome.storage.sync.get(["apiKey", "model", "promptTemplate"], (result) => {
      sendResponse({
        apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
        model: result.model || DEFAULT_SETTINGS.model,
        promptTemplate:
          result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
      });
    });
    return true; // Required for async sendResponse
  }

  if (request.action === "updateSettings") {
    chrome.storage.sync.set(
      {
        apiKey: request.settings.apiKey,
        model: request.settings.model,
        promptTemplate: request.settings.promptTemplate,
      },
      () => {
        sendResponse({ success: true });
      }
    );
    return true; // Required for async sendResponse
  }

  // Lisää settings-sivun avaus
  if (request.action === "openSettings") {
    // Avaa settings-sivu
    chrome.runtime.openOptionsPage
      ? chrome.runtime.openOptionsPage()
      : chrome.tabs.create({ url: "settings.html" });

    return false; // Ei tarvitse async-vastausta
  }
});

// Function to summarize article using OpenAI API (delegates to utils/openai.js)
async function summarizeArticle(articleContent) {
  try {
    // Get settings from storage
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(["apiKey", "model", "promptTemplate"], resolve);
    });

    if (!settings.apiKey) {
      throw new Error(
        "API key not configured. Please add your OpenAI API key in the extension settings."
      );
    }

    // Create prompt from template
    const prompt = settings.promptTemplate.replace(
      "{{ARTICLE_TEXT}}",
      articleContent
    );

    // Use the util function (assume it's loaded in the background context)
    if (typeof summarizeWithOpenAI !== "function") {
      throw new Error(
        "summarizeWithOpenAI is not available in background script. Please ensure utils/openai.js is loaded."
      );
    }

    return await summarizeWithOpenAI(settings.apiKey, settings.model, prompt);
  } catch (error) {
    console.error("Error in summarizeArticle:", error);
    throw error;
  }
}
