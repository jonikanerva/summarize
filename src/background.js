// Background script for managing extension state and API communication
import OpenAI from 'openai'

// Default settings
// TODO: duplication from settings.js
const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4.1',
  promptTemplate:
    'Summarize the provided content comprehensively and accurately, ensuring no key details are omitted.\n\nStart by generating a good title for the article stating what the text is about objectively, followed by the byline who is the author(s) of the article and date written.\n\nThen create a bulleted list of the objective facts and key points, followed by a bulleted list of the author’s opinions.\n\nThen write an assessment of whether the article provides sources for its facts, comment on the reliability of those sources, and/or the reputation of the author.\n\nConclude with a one-paragraph summary of the whole article.\n\nStructure your response using proper HTML formatting, using only element <H1>, <H2>, <UL>, <LI>, and <P>.\n\n{{ARTICLE_TEXT}}',
}

async function summarizeWithOpenAI(apiKey, model, prompt) {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_completion_tokens: 4096,
  })

  return response.choices[0].message.content.trim()
}

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
    const settings = {
      apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
      model: result.model || DEFAULT_SETTINGS.model,
      promptTemplate: result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
    }
    chrome.storage.sync.set(settings)
  })
})

/**
 * When the extension icon is clicked, inject the content script into the active tab,
 * then open the summary page.
 */
chrome.action.onClicked.addListener(async (tab) => {
  // First check if API key is set
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (!result.apiKey) {
      // If no API key, open settings page
      chrome.runtime.openOptionsPage
        ? chrome.runtime.openOptionsPage()
        : chrome.tabs.create({ url: '../html/settings.html' })
    } else {
      // Inject content script programmatically using scripting API
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['src/content.js'],
        },
        () => {
          // After injection, open the summary page as before
          chrome.tabs.create({
            url: chrome.runtime.getURL(`../html/summary.html?tabId=${tab.id}`),
          })
        },
      )
    }
  })
})

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizeArticle') {
    summarizeArticle(request.articleContent)
      .then((summary) => sendResponse({ success: true, summary }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Required for async sendResponse
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
      sendResponse({
        apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
        model: result.model || DEFAULT_SETTINGS.model,
        promptTemplate:
          result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
      })
    })
    return true // Required for async sendResponse
  }

  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(
      {
        apiKey: request.settings.apiKey,
        model: request.settings.model,
        promptTemplate: request.settings.promptTemplate,
      },
      () => {
        sendResponse({ success: true })
      },
    )
    return true // Required for async sendResponse
  }

  // Open settings page when requested
  if (request.action === 'openSettings') {
    chrome.runtime.openOptionsPage
      ? chrome.runtime.openOptionsPage()
      : chrome.tabs.create({ url: '../html/settings.html' })

    return false
  }
})

// Function to summarize article using OpenAI API (delegates to utils/openai.js)
async function summarizeArticle(articleData) {
  try {
    // Get settings from storage
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], resolve)
    })

    if (!settings.apiKey) {
      throw new Error(
        'API key not configured. Please add your OpenAI API key in the extension settings.',
      )
    }

    const article = `${articleData.title}
    ${articleData.byline}
    ${articleData.publishedTime}
    
    ${articleData.content}`

    // Create prompt from template
    const prompt = settings.promptTemplate.replace('{{ARTICLE_TEXT}}', article)

    // Use the util function (assume it's loaded in the background context)
    if (typeof summarizeWithOpenAI !== 'function') {
      throw new Error(
        'summarizeWithOpenAI is not available in background script. Please ensure utils/openai.js is loaded.',
      )
    }

    return await summarizeWithOpenAI(settings.apiKey, settings.model, prompt)
  } catch (error) {
    console.error('Error in summarizeArticle:', error)
    throw error
  }
}
