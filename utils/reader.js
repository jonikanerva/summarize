/**
 * Wrapper for using Mozilla's Readability library in Chrome extensions
 */

// Import Readability from the npm package
import { Readability } from '@mozilla/readability';

/**
 * Extract article content using Mozilla's Readability
 * @param {Document} doc - Document to parse
 * @return {Object} - Article object with title and content
 */
function parseArticle(doc) {
  try {
    // Create a clone of the document to avoid modifying the original
    const documentClone = doc.cloneNode(true);
    
    // Create a new article using Readability
    const reader = new Readability(documentClone);
    const article = reader.parse();
    
    if (!article || !article.content) {
      throw new Error('Readability could not parse the document');
    }
    
    return article;
  } catch (error) {
    console.error('Error in Readability parser:', error);
    throw error;
  }
}

// Export the function to be used in content scripts
export { parseArticle };