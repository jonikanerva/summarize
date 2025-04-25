// Background script for managing extension state and API communication

// Default settings
const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4.1',
  promptTemplate: 'Please provide a concise summary of the following article, highlighting the main points, key arguments, and conclusions in about 3-5 bullet points:\n\n{{ARTICLE_TEXT}}'
};

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
    const settings = {
      apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
      model: result.model || DEFAULT_SETTINGS.model,
      promptTemplate: result.promptTemplate || DEFAULT_SETTINGS.promptTemplate
    };
    chrome.storage.sync.set(settings);
  });
});

// When the extension icon is clicked, automatically summarize the current page
chrome.action.onClicked.addListener((tab) => {
  // First check if API key is set
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (!result.apiKey) {
      // If no API key, open settings page
      chrome.runtime.openOptionsPage ? 
        chrome.runtime.openOptionsPage() : 
        chrome.tabs.create({ url: 'settings.html' });
    } else {
      // Send message to content script to start summarization
      chrome.tabs.sendMessage(tab.id, { action: 'summarize' });
    }
  });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizeArticle') {
    summarizeArticle(request.articleContent)
      .then(summary => sendResponse({ success: true, summary }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
      sendResponse({
        apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
        model: result.model || DEFAULT_SETTINGS.model,
        promptTemplate: result.promptTemplate || DEFAULT_SETTINGS.promptTemplate
      });
    });
    return true; // Required for async sendResponse
  }

  if (request.action === 'updateSettings') {
    chrome.storage.sync.set({
      apiKey: request.settings.apiKey,
      model: request.settings.model,
      promptTemplate: request.settings.promptTemplate
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  // Lisää settings-sivun avaus
  if (request.action === 'openSettings') {
    // Avaa settings-sivu
    chrome.runtime.openOptionsPage ? 
      chrome.runtime.openOptionsPage() : 
      chrome.tabs.create({ url: 'settings.html' });
    
    return false; // Ei tarvitse async-vastausta
  }
});

// Function to summarize article using OpenAI API
async function summarizeArticle(articleContent) {
  try {
    // Get settings from storage
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], resolve);
    });

    if (!settings.apiKey) {
      throw new Error('API key not configured. Please add your OpenAI API key in the extension settings.');
    }

    // Create prompt from template
    const prompt = settings.promptTemplate.replace('{{ARTICLE_TEXT}}', articleContent);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in summarizeArticle:', error);
    throw error;
  }
}
