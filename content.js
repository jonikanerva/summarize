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
        <button id="open-settings" class="action-button" title="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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
  
  document.getElementById('open-settings').addEventListener('click', () => {
    // Lähetä viesti taustaskriptille avaamaan asetukset
    chrome.runtime.sendMessage({ action: 'openSettings' });
  });

  return container;
}

// Function to extract article content using Readability or fallback methods
function extractArticleContent() {
  try {
    console.log('Starting article extraction');
    
    // APPROACH 1: Try the direct selector method first (fastest and most reliable for many sites)
    try {
      console.log('Attempting direct selector method first');
      
      // Common article content selectors
      const selectors = [
        'article', 
        '[role="article"]', 
        '.article-content', 
        '.post-content', 
        '.entry-content', 
        '.content', 
        '#content',
        'main .article',
        '.main-content',
        '.article-body', 
        '.story-body',
        '[itemprop="articleBody"]',
        '.post', 
        '.story'
      ];
      
      // Try each selector
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        
        if (element) {
          // Check if it has substantial content
          const text = element.innerText.trim();
          if (text.length > 500) {
            console.log(`Found content using selector: ${selector}`);
            
            // Extract paragraphs and headings
            const paragraphs = [...element.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
              .map(node => node.textContent.trim())
              .filter(text => text.length > 0)
              .join('\n\n');
              
            if (paragraphs.length > 300) {
              return {
                title: document.title,
                content: paragraphs
              };
            }
            
            // If not enough structured paragraphs, return all text
            return {
              title: document.title,
              content: text
            };
          }
        }
      }
      
      console.log('Direct selector method failed, no matching content-rich elements found');
    } catch (selectorError) {
      console.warn('Error in direct selector method:', selectorError);
    }
    
    // APPROACH 2: Try Readability library
    try {
      console.log('Attempting Readability method');
      
      // Create a clone of the document to avoid modifying the original
      const documentClone = document.cloneNode(true);
      
      // Check if Readability is available
      if (typeof Readability === 'undefined') {
        console.warn('Readability library not loaded');
        throw new Error('Readability not available');
      }
      
      // Create a new Readability object and parse
      const reader = new Readability(documentClone);
      const article = reader.parse();
      
      if (article && article.content && article.content.length > 200) {
        console.log('Successfully extracted content with Readability');
        
        // Get the text content from the parsed article
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content;
        
        // Get all text nodes and join them
        const textContent = [...tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0)
          .join('\n\n');
        
        if (textContent.length > 300) {
          return {
            title: article.title || document.title,
            content: textContent
          };
        }
      }
      
      console.log('Readability method failed or returned insufficient content');
    } catch (readabilityError) {
      console.warn('Readability extraction failed:', readabilityError);
    }
    
    // APPROACH 3: Density-based approach - find block with highest paragraph density
    try {
      console.log('Attempting paragraph density approach');
      
      // Get all paragraphs
      const paragraphs = document.querySelectorAll('p');
      
      // Only proceed if we have enough paragraphs
      if (paragraphs.length >= 5) {
        // Count paragraphs by parent to find the densest container
        const parentCounts = {};
        
        for (const p of paragraphs) {
          const parent = p.parentNode;
          
          // Skip very short paragraphs
          if (p.textContent.trim().length < 20) continue;
          
          // Create unique identifier for the parent
          const key = parent.tagName + (parent.id ? `#${parent.id}` : '') + (parent.className ? `.${parent.className}` : '');
          
          if (!parentCounts[key]) {
            parentCounts[key] = {
              element: parent,
              count: 0,
              textLength: 0
            };
          }
          
          parentCounts[key].count++;
          parentCounts[key].textLength += p.textContent.trim().length;
        }
        
        // Find the parent with the most text in paragraphs
        let bestParent = null;
        let bestScore = 0;
        
        for (const key in parentCounts) {
          const info = parentCounts[key];
          
          // Calculate score based on paragraph count and text length
          const score = info.count * info.textLength;
          
          if (info.count >= 3 && score > bestScore) {
            bestScore = score;
            bestParent = info.element;
          }
        }
        
        if (bestParent) {
          console.log('Found best parent by paragraph density');
          const contentFromBestParent = [...bestParent.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
            .map(node => node.textContent.trim())
            .filter(text => text.length > 0)
            .join('\n\n');
            
          if (contentFromBestParent.length > 300) {
            return {
              title: document.title,
              content: contentFromBestParent
            };
          }
        }
      }
      
      console.log('Paragraph density approach failed');
    } catch (densityError) {
      console.warn('Error in paragraph density approach:', densityError);
    }
    
    // APPROACH 4: Find element with most text content
    try {
      console.log('Attempting most-text approach');
      
      // Find elements with a substantial amount of text
      const allElements = document.querySelectorAll('div, section, article, main');
      let bestElement = null;
      let mostTextLength = 0;
      
      for (const element of allElements) {
        // Skip elements that are likely not main content
        const className = (element.className || '').toLowerCase();
        const id = (element.id || '').toLowerCase();
        
        if (className.includes('nav') || className.includes('menu') || 
            className.includes('header') || className.includes('footer') ||
            className.includes('comment') || className.includes('sidebar') ||
            id.includes('nav') || id.includes('menu') || 
            id.includes('header') || id.includes('footer') ||
            id.includes('comment') || id.includes('sidebar')) {
          continue;
        }
        
        const textLength = element.innerText.length;
        if (textLength > mostTextLength && textLength > 500) {
          mostTextLength = textLength;
          bestElement = element;
        }
      }
      
      if (bestElement && mostTextLength > 500) {
        console.log('Found element with most text');
        
        // Get paragraphs from the best element
        const bestParagraphs = [...bestElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0)
          .join('\n\n');
        
        if (bestParagraphs.length > 300) {
          return {
            title: document.title,
            content: bestParagraphs
          };
        }
        
        // If not enough structured paragraphs, just use all text
        return {
          title: document.title,
          content: bestElement.innerText
        };
      }
      
      console.log('Most-text approach failed');
    } catch (mostTextError) {
      console.warn('Error in most-text approach:', mostTextError);
    }
    
    // APPROACH 5: Last resort - use visible body text
    console.log('Using body text as last resort');
    
    // Get all visible text in the body
    const bodyText = document.body.innerText;
    if (bodyText.length > 1000) {
      // Try to remove navigation, header and footer content by taking the middle portion
      const startPos = Math.floor(bodyText.length * 0.1); 
      const endPos = Math.floor(bodyText.length * 0.9);
      const trimmedText = bodyText.substring(startPos, endPos);
      
      return {
        title: document.title,
        content: trimmedText
      };
    }
    
    // If we're here, we really couldn't find good content
    throw new Error('No substantial content found on this page');
    
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
