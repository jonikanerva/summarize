/**
 * Wrapper for using Mozilla's Readability library in Chrome extensions
 */

// We'll use the global Readability object that gets exposed from the npm package
// This will be included via script tag in the manifest.json

/**
 * Extract article content using Mozilla's Readability
 * @param {Document} doc - Document to parse
 * @return {Object} - Article object with title and content
 */
function parseArticle(doc) {
  try {
    console.log('Starting Readability parser');
    // Make sure Readability is available
    if (typeof Readability === 'undefined') {
      console.error('Readability is not defined. Make sure the library is properly loaded.');
      throw new Error('Readability library not loaded');
    }
    
    // Create a clone of the document to avoid modifying the original
    const documentClone = doc.cloneNode(true);
    
    console.log('Created document clone');
    
    // Create a new article using Readability
    const reader = new Readability(documentClone);
    console.log('Created Readability reader');
    
    const article = reader.parse();
    console.log('Parsed article:', article ? 'Success' : 'Failed');
    
    if (!article || !article.content) {
      throw new Error('Readability could not parse the document');
    }
    
    return article;
  } catch (error) {
    console.error('Error in Readability parser:', error);
    throw error;
  }
}