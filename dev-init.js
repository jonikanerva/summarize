// Development initialization script to help with testing
// This script injects environment variables into localStorage for development

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're in a development environment
  if (typeof chrome === 'undefined' || typeof chrome.storage === 'undefined') {
    console.log('Running in development mode - setting up environment');
    
    // First check if we need to fetch the API key
    if (!localStorage.getItem('apiKey')) {
      // Fetch API key from our server endpoint
      fetch('/get-api-key')
        .then(response => response.json())
        .then(data => {
          if (data && data.apiKey) {
            localStorage.setItem('apiKey', data.apiKey);
            console.log('API key successfully loaded from server');
            // Update the form if we're on settings page
            const apiKeyInput = document.getElementById('api-key');
            if (apiKeyInput) {
              apiKeyInput.value = data.apiKey;
            }
          } else {
            console.log('No API key available from server');
          }
        })
        .catch(error => {
          console.error('Error fetching API key:', error);
        });
    }
    
    // Set default model if not set
    if (!localStorage.getItem('model')) {
      localStorage.setItem('model', 'gpt-4o');
    }
    
    // Set default prompt template if not set
    if (!localStorage.getItem('promptTemplate')) {
      localStorage.setItem('promptTemplate', 
        'Please provide a concise summary of the following article, highlighting the main points, key arguments, and conclusions in about 3-5 bullet points:\n\n{{ARTICLE_TEXT}}'
      );
    }
    
    // Log the availability of API key
    console.log('API Key Status:', localStorage.getItem('apiKey') ? 'Available' : 'Not set');
  }
});