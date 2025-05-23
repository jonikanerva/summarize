// Content script for article extraction
import { Readability } from '@mozilla/readability'

// Function to extract article content using Readability or fallback methods
function extractArticleContent() {
  try {
    console.log('Starting article extraction')

    // Create a clone of the document to avoid modifying the original
    const documentClone = document.cloneNode(true)

    // Create a new Readability object and parse
    const reader = new Readability(documentClone)
    const article = reader.parse()

    if (article && article.content && article.length > 200) {
      console.log('Successfully extracted content with Readability')

      return {
        title: article.title,
        content: article.textContent,
        htmlContent: article.content,
        byline: article.byline,
        publishedTime: article.publishedTime,
      }
    }

    console.log('Readability returned insufficient content')
  } catch (readabilityError) {
    console.error('Readability extraction failed:', readabilityError)
  }

  throw new Error(
    'Failed to extract article content. This may not be an article page or the content is not accessible.',
  )
}

// Add message listener for commands from popup
if (!window.__SUMMARIZE_CONTENT_SCRIPT_INJECTED__) {
  window.__SUMMARIZE_CONTENT_SCRIPT_INJECTED__ = true
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      try {
        const article = extractArticleContent()
        sendResponse({
          success: true,
          title: article.title,
          content: article.content,
          htmlContent: article.htmlContent,
          byline: article.byline,
          publishedTime: article.publishedTime,
        })
      } catch (e) {
        sendResponse({ success: false, error: e.message })
      }
      return true
    }
  })
}
