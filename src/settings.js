// Settings page script

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form')
  const apiKeyInput = document.getElementById('api-key')
  const modelInput = document.getElementById('model')
  const promptTemplateTextarea = document.getElementById('prompt-template')
  const toggleApiKeyBtn = document.getElementById('toggle-api-key')
  const restoreDefaultsBtn = document.getElementById('restore-defaults')
  const statusMessage = document.getElementById('status-message')

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
      apiKeyInput.value = result.apiKey
      modelInput.value = result.model
      promptTemplateTextarea.value = result.promptTemplate
    })
  }

  // Save settings
  function saveSettings(e) {
    e.preventDefault()

    const settings = {
      apiKey: apiKeyInput.value.trim(),
      model: modelInput.value.trim(),
      promptTemplate: promptTemplateTextarea.value,
    }

    // Validate settings
    if (!settings.apiKey) {
      showStatus('Please enter your OpenAI API key.', 'error')
      return
    }

    if (!settings.promptTemplate.includes('{{ARTICLE_TEXT}}')) {
      showStatus(
        'Prompt template must include {{ARTICLE_TEXT}} placeholder.',
        'error',
      )
      return
    }

    // Save to storage
    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success')
    })

    // Inform background script of settings update
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings,
    })
  }

  // TODO: Restore default settings (duplication from background.js)
  const DEFAULT_SETTINGS = {
    apiKey: '',
    model: 'gpt-4.1',
    promptTemplate:
      'Summarize the provided content comprehensively and accurately, ensuring no key details are omitted.\n\nStart by generating a good title for the article stating what the text is about objectively, followed by the byline who is the author(s) of the article and date written.\n\nThen create a bulleted list of the objective facts and key points, followed by a bulleted list of the author’s opinions.\n\nThen write an assessment of whether the article provides sources for its facts, comment on the reliability of those sources, and/or the reputation of the author.\n\nConclude with a one-paragraph summary of the whole article.\n\nStructure your response using proper HTML formatting, using only element <H1>, <H2>, <UL>, <LI>, and <P>.\n\n{{ARTICLE_TEXT}}',
  }

  function restoreDefaults() {
    apiKeyInput.value = DEFAULT_SETTINGS.apiKey
    modelInput.value = DEFAULT_SETTINGS.model
    promptTemplateTextarea.value = DEFAULT_SETTINGS.promptTemplate
    showStatus('Default settings restored. Click Save to apply.', 'info')
  }

  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text'
      toggleApiKeyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `
    } else {
      apiKeyInput.type = 'password'
      toggleApiKeyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `
    }
  }

  // Show status message
  function showStatus(message, type = 'info') {
    statusMessage.textContent = message
    statusMessage.className = 'status-message'
    statusMessage.classList.add(`status-${type}`)

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMessage.textContent = ''
      statusMessage.className = 'status-message'
    }, 5000)
  }

  // Initialize
  loadSettings()

  // Event listeners
  form.addEventListener('submit', saveSettings)
  restoreDefaultsBtn.addEventListener('click', restoreDefaults)
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility)
})
