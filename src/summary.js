// Summary page script for displaying article summaries
import DOMPurify from 'dompurify'

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading-indicator')
  const summary = document.getElementById('openai-summary-html')
  const article = document.getElementById('original-article')
  const settingsBtn = document.getElementById('open-settings')
  const followUpForm = document.getElementById('follow-up-form')
  const followUpInput = document.getElementById('follow-up-input')
  const followUpSubmit = document.getElementById('follow-up-submit')
  const followUpResponsesContainer = document.getElementById(
    'follow-up-responses-container',
  )

  let currentArticleContent = null
  let currentSummary = null
  let conversationHistory = []

  settingsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      chrome.tabs.create({ url: '../html/settings.html' })
    }
  })

  // Auto-resize textarea
  followUpInput.addEventListener('input', function () {
    this.style.height = 'auto'
    this.style.height = Math.min(this.scrollHeight, 120) + 'px'
  })

  // Handle keyboard shortcuts in textarea
  followUpInput.addEventListener('keydown', function (e) {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleFollowUpQuestion(e)
    }
  })

  // Handle follow-up form submission
  followUpForm.addEventListener('submit', handleFollowUpQuestion)

  const params = new URLSearchParams(location.search)
  const tabId = Number(params.get('tabId'))

  if (!tabId) {
    summary.innerHTML = '<p>No active tab detected.</p>'
    loading.style.display = 'none'
    return
  }

  function generateSummary() {
    chrome.tabs.sendMessage(tabId, { action: 'extractContent' }, (resp) => {
      loading.style.display = ''
      document.title = 'Summary'
      summary.innerHTML = ''

      if (!resp || !resp.success) {
        loading.style.display = 'none'
        summary.innerHTML = `<p>Error extracting: ${resp?.error}</p>`
        return
      }

      if (resp.title) {
        document.title = `Summary: ${resp.title}`
      }

      if (resp.htmlContent) {
        article.innerHTML = `<h1>${resp.title}</h1>${DOMPurify.sanitize(resp.htmlContent)}`
      }

      // Store article content for follow-up questions
      currentArticleContent = resp

      chrome.runtime.sendMessage(
        { action: 'summarizeArticle', articleContent: resp },
        (res) => {
          loading.style.display = 'none'

          if (res.success) {
            summary.innerHTML = DOMPurify.sanitize(res.summary)
            currentSummary = res.summary

            // Initialize conversation history with the messages from summarizeArticle
            conversationHistory = [
              ...res.initialMessages,
              { role: 'assistant', content: res.summary },
            ]
          } else {
            summary.innerHTML = `<p>Summarization failed: ${res.error}</p>`
          }
        },
      )
    })
  }

  // Handle follow-up question submission
  function handleFollowUpQuestion(e) {
    e.preventDefault()

    const question = followUpInput.value.trim()
    if (!question || !currentArticleContent || !currentSummary) return

    // Disable form while processing
    followUpSubmit.disabled = true
    followUpInput.disabled = true

    // Create response container
    const responseDiv = document.createElement('div')
    responseDiv.className = 'follow-up-response'

    responseDiv.innerHTML = `
      <div class="summary-header">
        <div class="summary-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="summary-icon">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M7 7H17" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M7 12H17" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M7 17H13" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <div class="summary-title">
          <h2>Follow-up Response</h2>
        </div>
      </div>
      <div class="summary-content">
        <div class="follow-up-question">${DOMPurify.sanitize(question)}</div>
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Generating response...</p>
        </div>
      </div>
    `

    // Insert at the top of responses container
    followUpResponsesContainer.insertBefore(
      responseDiv,
      followUpResponsesContainer.firstChild,
    )

    // Scroll to top to show the new response
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Clear input
    followUpInput.value = ''
    followUpInput.style.height = 'auto'

    // Add user question to conversation history
    conversationHistory.push({
      role: 'user',
      content: question,
    })

    // Send request to background script
    chrome.runtime.sendMessage(
      {
        action: 'askFollowUpQuestion',
        conversationHistory: conversationHistory,
      },
      (response) => {
        // Re-enable form
        followUpSubmit.disabled = false
        followUpInput.disabled = false
        followUpInput.focus()

        const loadingDiv = responseDiv.querySelector('.loading-indicator')

        if (response && response.success) {
          // Add assistant response to conversation history
          conversationHistory.push({
            role: 'assistant',
            content: response.answer,
          })
          loadingDiv.outerHTML = `<div class="openai-summary-html">${DOMPurify.sanitize(response.answer)}</div>`
        } else {
          // Remove the question from history if the request failed
          conversationHistory.pop()
          loadingDiv.outerHTML = `<p>Error: ${response?.error || 'Failed to get response'}</p>`
        }
      },
    )
  }

  // initial summary generation
  generateSummary()
})
