// Popup script for handling user interactions and communicating with background script

document.addEventListener('DOMContentLoaded', () => {
  const summarizeBtn = document.getElementById('summarize-btn');
  const openSettingsBtn = document.getElementById('open-settings');
  const apiKeyNotice = document.getElementById('api-key-notice');
  const statusMessage = document.getElementById('status-message');

  // Check if API key is set
  chrome.storage.sync.get(['apiKey'], (result) => {
    if (!result.apiKey) {
      apiKeyNotice.classList.remove('hidden');
      summarizeBtn.disabled = true;
    } else {
      apiKeyNotice.classList.add('hidden');
      summarizeBtn.disabled = false;
    }
  });

  // Summarize button click handler
  summarizeBtn.addEventListener('click', () => {
    // Show loading state
    statusMessage.textContent = 'Summarizing...';
    statusMessage.classList.add('status-info');
    
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Send message to content script
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: 'summarize' },
        (response) => {
          if (chrome.runtime.lastError) {
            statusMessage.textContent = 'Error: Could not communicate with the page.';
            statusMessage.classList.remove('status-info');
            statusMessage.classList.add('status-error');
            return;
          }
          
          if (response && response.status === 'started') {
            statusMessage.textContent = 'Summary is being generated at the top of the page.';
            statusMessage.classList.remove('status-error');
            statusMessage.classList.add('status-success');
            
            // Close popup after a delay
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        }
      );
    });
  });

  // Open settings page
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage ? 
      chrome.runtime.openOptionsPage() : 
      chrome.tabs.create({ url: 'settings.html' });
  });
});
