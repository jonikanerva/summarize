// Summary page script for displaying article summaries
document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading-indicator')
  const summary = document.getElementById('openai-summary-html')
  const article = document.getElementById('original-article')
  const settingsBtn = document.getElementById('open-settings')
  const reloadBtn = document.getElementById('reload-summary')

  reloadBtn.addEventListener('click', generateSummary)
  settingsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      chrome.tabs.create({ url: '../html/settings.html' })
    }
  })
  const params = new URLSearchParams(location.search)
  const tabId = Number(params.get('tabId'))

  if (!tabId) {
    summary.innerHTML = '<p>No active tab detected.</p>'
    loading.style.display = 'none'
    return
  }

  function generateSummary() {
    chrome.tabs.sendMessage(tabId, { action: 'extractContent' }, (resp) => {
      if (!resp || !resp.success) {
        loading.style.display = 'none'
        summary.innerHTML = `<p>Error extracting: ${resp?.error}</p>`
        return
      }

      if (resp.title) {
        document.title = `Summary: ${resp.title}`
      }

      if (resp.htmlContent) {
        article.innerHTML = `<h1>${resp.title}</h1>${resp.htmlContent}`
      }

      chrome.runtime.sendMessage(
        { action: 'summarizeArticle', articleContent: resp },
        (res) => {
          loading.style.display = 'none'

          if (res.success) {
            summary.innerHTML = res.summary
          } else {
            summary.innerHTML = `<p>Summarization failed: ${res.error}</p>`
          }
        },
      )
    })
  }

  // initial summary generation
  generateSummary()
})
