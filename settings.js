// Settings page script

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const apiKeyInput = document.getElementById('api-key');
  const modelSelect = document.getElementById('model');
  const promptTemplateTextarea = document.getElementById('prompt-template');
  const toggleApiKeyBtn = document.getElementById('toggle-api-key');
  const restoreDefaultsBtn = document.getElementById('restore-defaults');
  const statusMessage = document.getElementById('status-message');

  // Default settings
  const DEFAULT_SETTINGS = {
    apiKey: '',
    model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    promptTemplate: 'Please provide a concise summary of the following article, highlighting the main points, key arguments, and conclusions in about 3-5 bullet points:\n\n{{ARTICLE_TEXT}}'
  };

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'model', 'promptTemplate'], (result) => {
      apiKeyInput.value = result.apiKey || '';
      modelSelect.value = result.model || DEFAULT_SETTINGS.model;
      promptTemplateTextarea.value = result.promptTemplate || DEFAULT_SETTINGS.promptTemplate;
    });
  }

  // Save settings
  function saveSettings(e) {
    e.preventDefault();
    
    const settings = {
      apiKey: apiKeyInput.value.trim(),
      model: modelSelect.value,
      promptTemplate: promptTemplateTextarea.value
    };
    
    // Validate settings
    if (!settings.apiKey) {
      showStatus('Please enter your OpenAI API key.', 'error');
      return;
    }
    
    if (!settings.promptTemplate.includes('{{ARTICLE_TEXT}}')) {
      showStatus('Prompt template must include {{ARTICLE_TEXT}} placeholder.', 'error');
      return;
    }
    
    // Save to storage
    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success');
    });
    
    // Inform background script of settings update
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings
    });
  }

  // Restore default settings
  function restoreDefaults() {
    apiKeyInput.value = DEFAULT_SETTINGS.apiKey;
    modelSelect.value = DEFAULT_SETTINGS.model;
    promptTemplateTextarea.value = DEFAULT_SETTINGS.promptTemplate;
    
    showStatus('Default settings restored. Click Save to apply.', 'info');
  }

  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="eye-icon">
          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  // Show status message
  function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(`status-${type}`);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, 5000);
  }

  // Initialize
  loadSettings();
  
  // Event listeners
  form.addEventListener('submit', saveSettings);
  restoreDefaultsBtn.addEventListener('click', restoreDefaults);
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
});
