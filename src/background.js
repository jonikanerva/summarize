// Background script for managing extension state and API communication
import OpenAI from 'openai'
import { DEFAULT_OUTPUT, DEFAULT_SETTINGS } from './config.js' // Import default settings

async function summarizeWithOpenAI(messages, options) {
  // Get settings from storage
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey', 'model'], resolve)
  })

  if (!settings.apiKey) {
    throw new Error(
      '"API key" not configured. Please add your OpenAI API key in the extension settings.',
    )
  }

  if (!settings.model) {
    throw new Error(
      '"model" not configured. Please add the model name in the extension settings.',
    )
  }

  const openai = new OpenAI({ apiKey: settings.apiKey })

  // Prepare request parameters
  const requestParams = {
    model: settings.model,
    input: messages,
    store: true,
    temperature: 0.2,
    ...options,
  }

  const response = await openai.responses.create(requestParams)

  return {
    content: response.output_text?.trim() || response.output?.trim(),
    responseId: response.id,
  }
}

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ['apiKey', 'model', 'promptTemplate', 'allowWebSearch'],
    (result) => {
      const settings = {
        apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
        model: result.model || DEFAULT_SETTINGS.model,
        promptTemplate:
          result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
        allowWebSearch:
          result.allowWebSearch === undefined
            ? DEFAULT_SETTINGS.allowWebSearchCheckbox
            : result.allowWebSearch,
      }
      chrome.storage.sync.set(settings)
    },
  )
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
      .then((result) =>
        sendResponse({
          success: true,
          summary: result.summary,
          responseId: result.responseId,
        }),
      )
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Required for async sendResponse
  }

  if (request.action === 'askFollowUpQuestion') {
    // Get web search setting from storage
    chrome.storage.sync.get(['allowWebSearch'], (result) => {
      // Create messages array for follow-up question
      const messages = [
        {
          role: 'user',
          content: request.question,
        },
        {
          role: 'system',
          content: DEFAULT_OUTPUT,
        },
      ]

      const enableWebSearch =
        result.allowWebSearch === undefined
          ? DEFAULT_SETTINGS.allowWebSearchCheckbox
          : result.allowWebSearch
      const options = {
        previous_response_id: request.previousResponseId,
        tools: enableWebSearch ? [{ type: 'web_search_preview' }] : [],
      }

      summarizeWithOpenAI(messages, options)
        .then((result) =>
          sendResponse({
            success: true,
            answer: result.content,
            responseId: result.responseId,
          }),
        )
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        )
    })
    return true // Required for async sendResponse
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(
      ['apiKey', 'model', 'promptTemplate', 'allowWebSearch'],
      (result) => {
        sendResponse({
          apiKey: result.apiKey || DEFAULT_SETTINGS.apiKey,
          model: result.model || DEFAULT_SETTINGS.model,
          promptTemplate:
            result.promptTemplate || DEFAULT_SETTINGS.promptTemplate,
          allowWebSearch:
            result.allowWebSearch === undefined
              ? DEFAULT_SETTINGS.allowWebSearchCheckbox
              : result.allowWebSearch,
        })
      },
    )
    return true // Required for async sendResponse
  }

  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(
      {
        apiKey: request.settings.apiKey,
        model: request.settings.model,
        promptTemplate: request.settings.promptTemplate,
        allowWebSearch: request.settings.allowWebSearch,
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

// Function to summarize article using OpenAI API
async function summarizeArticle(articleData) {
  try {
    // Get settings from storage for promptTemplate
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(['promptTemplate'], resolve)
    })

    if (!settings.promptTemplate) {
      throw new Error(
        '"Prompt template" not configured. Please add the template in the extension settings.',
      )
    }

    const article = `${articleData.title}
    ${articleData.byline}
    ${articleData.publishedTime}
    
    ${articleData.content}`

    // Create prompt from template
    const prompt = settings.promptTemplate.replace('{{ARTICLE_TEXT}}', article)

    // Create messages array with system role for HTML formatting and user role for content
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
      {
        role: 'system',
        content: DEFAULT_OUTPUT,
      },
    ]

    const options = {
      tools: [],
    }

    // Use Responses API with store:true for initial summary
    const result = await summarizeWithOpenAI(messages, options)

    return {
      summary: result.content,
      responseId: result.responseId,
    }
  } catch (error) {
    console.error('Error in summarizeArticle:', error)
    throw error
  }
}
