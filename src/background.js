// Background script for managing extension state and API communication
import OpenAI from 'openai'
import { DEFAULT_SETTINGS } from './config.js' // Import default settings

async function summarizeWithOpenAI(messagesInput) {
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

  // Add system message for HTML formatting to existing messages
  const messages = [
    ...messagesInput,
    {
      role: 'system',
      content:
        'Structure your response using proper HTML formatting, using only element <H1>, <H2>, <UL>, <LI>, and <P>',
    },
  ]

  const response = await openai.chat.completions.create({
    model: settings.model,
    messages,
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
      .then((result) =>
        sendResponse({
          success: true,
          summary: result.summary,
          initialMessages: result.initialMessages,
        }),
      )
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Required for async sendResponse
  }

  if (request.action === 'askFollowUpQuestion') {
    summarizeWithOpenAI(request.conversationHistory)
      .then((answer) => sendResponse({ success: true, answer }))
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

    // Create messages array for OpenAI API - this will be the initial conversation
    const messages = [{ role: 'system', content: prompt }]

    const summary = await summarizeWithOpenAI(messages)

    // Return both summary and the initial messages for conversation history
    return { summary, initialMessages: messages }
  } catch (error) {
    console.error('Error in summarizeArticle:', error)
    throw error
  }
}
