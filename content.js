// Content script for article extraction and summary display

// Function to insert summary container at the top of the page
function insertSummaryContainer() {
  // Check if the container already exists
  if (document.getElementById('article-summary-container')) {
    return document.getElementById('article-summary-container');
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'article-summary-container';
  container.className = 'article-summary-extension';
  container.innerHTML = `
    <div class="summary-header">
      <div class="summary-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="summary-icon">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 7H17" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 12H17" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 17H13" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2>Article Summary</h2>
      </div>
      <div class="summary-actions">
        <button id="regenerate-summary" class="action-button" title="Regenerate Summary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 4V10H17" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 20V14H7" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.51 9.00001C4.01717 7.56455 4.87913 6.28824 6.01547 5.30841C7.1518 4.32858 8.52547 3.67883 9.99875 3.4233C11.472 3.16777 12.9805 3.32062 14.3668 3.86611C15.753 4.41161 16.9651 5.32925 17.87 6.50001L23 10M1 14L6.13 17.5C7.03494 18.6708 8.24698 19.5884 9.63324 20.1339C11.0195 20.6794 12.528 20.8323 14.0013 20.5767C15.4745 20.3212 16.8482 19.6715 17.9845 18.6916C19.1209 17.7118 19.9828 16.4355 20.49 15" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button id="close-summary" class="action-button" title="Close Summary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="summary-content" class="summary-content">
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Generating summary...</p>
      </div>
    </div>
  `;

  // Insert at the top of the body
  document.body.insertBefore(container, document.body.firstChild);

  // Add event listeners
  document.getElementById('close-summary').addEventListener('click', () => {
    container.remove();
  });

  document.getElementById('regenerate-summary').addEventListener('click', () => {
    extractAndSummarize();
  });

  return container;
}

// Function to extract article content using Readability
function extractArticleContent() {
  try {
    // Create a clone of the document to avoid modifying the original
    const documentClone = document.cloneNode(true);
    
    // Create a new article using Readability
    const reader = new Readability(documentClone);
    const article = reader.parse();
    
    if (!article || !article.content) {
      throw new Error('Could not extract article content');
    }
    
    // Get the text content from the parsed article
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    
    // Get all text nodes and join them
    const textContent = [...tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
      .map(node => node.textContent.trim())
      .filter(text => text.length > 0)
      .join('\n\n');
    
    return {
      title: article.title,
      content: textContent
    };
  } catch (error) {
    console.error('Error extracting article content:', error);
    throw new Error('Failed to extract article content. This may not be an article page or the content is not accessible.');
  }
}

// Function to show error in the summary container
function showError(message) {
  const summaryContent = document.getElementById('summary-content');
  if (summaryContent) {
    summaryContent.innerHTML = `
      <div class="error-message">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EA4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V12" stroke="#EA4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16H12.01" stroke="#EA4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>${message}</p>
      </div>
    `;
  }
}

// Function to show loading state
function showLoading() {
  const summaryContent = document.getElementById('summary-content');
  if (summaryContent) {
    summaryContent.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Generating summary...</p>
      </div>
    `;
  }
}

// Function to extract article and send it to OpenAI for summarization
async function extractAndSummarize() {
  try {
    // Insert or get container
    const container = insertSummaryContainer();
    
    // Show loading
    showLoading();
    
    // Extract article content
    const article = extractArticleContent();
    
    if (!article.content || article.content.trim().length === 0) {
      showError('No article content found on this page.');
      return;
    }
    
    // Send message to background script to summarize
    chrome.runtime.sendMessage(
      {
        action: 'summarizeArticle',
        articleContent: article.content
      },
      response => {
        if (response.success) {
          // Display summary
          const summaryContent = document.getElementById('summary-content');
          if (summaryContent) {
            // Format the summary - convert bullet points to proper HTML
            let formattedSummary = response.summary
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/\* /g, '• ');
              
            summaryContent.innerHTML = `<p>${formattedSummary}</p>`;
          }
        } else {
          // Display error
          showError(response.error || 'An unknown error occurred.');
        }
      }
    );
  } catch (error) {
    console.error('Error in extractAndSummarize:', error);
    showError(error.message || 'An unknown error occurred.');
  }
}

// Add message listener for commands from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    extractAndSummarize();
    sendResponse({ status: 'started' });
  }
});
