/*
 * This file provides an integration with Mozilla's Readability library
 * which is used to extract the main content from web pages.
 * 
 * It includes a simplified version of the Readability.js library
 * from the Mozilla project.
 */

(function(global) {
  // Import Readability from Mozilla's project if it exists
  if (typeof Readability !== 'undefined') {
    // Readability already defined, don't redefine
    return;
  }

  /*
   * Readability. An Article parser for extracting the main content of a web page.
   * Based on Readability.js from Mozilla.
   */
  
  function Readability(doc) {
    this._doc = doc;
    this._articleTitle = null;
    this._articleContent = null;
    this._isParsed = false;
  }

  Readability.prototype = {
    /**
     * Parse the document and extract the article content
     * @return {Object} article object with title and content
     */
    parse: function() {
      if (this._isParsed) {
        return {
          title: this._articleTitle,
          content: this._articleContent
        };
      }

      // Clone the document to avoid modifying the original
      const docClone = this._doc.cloneNode(true);
      
      try {
        this._articleTitle = this._getArticleTitle(docClone);
        this._articleContent = this._getArticleContent(docClone);
        this._isParsed = true;
        
        return {
          title: this._articleTitle,
          content: this._articleContent
        };
      } catch (e) {
        console.error('Error parsing document with Readability:', e);
        return null;
      }
    },

    /**
     * Get the article title from the document
     * @param {Document} doc - The document to extract the title from
     * @return {string} The article title
     */
    _getArticleTitle: function(doc) {
      // Try to get the title from meta tags first
      const metaTitleElements = doc.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]');
      for (let i = 0; i < metaTitleElements.length; i++) {
        const metaTitle = metaTitleElements[i].getAttribute('content');
        if (metaTitle && metaTitle.length > 0) {
          return metaTitle.trim();
        }
      }
      
      // Try to find a suitable h1 element
      const h1Elements = doc.getElementsByTagName('h1');
      if (h1Elements.length === 1) {
        return h1Elements[0].textContent.trim();
      }
      
      // Fall back to the document title
      return doc.title.trim();
    },

    /**
     * Get the article content from the document
     * @param {Document} doc - The document to extract the content from
     * @return {string} The article content as HTML
     */
    _getArticleContent: function(doc) {
      // Remove scripts, styles, and other unwanted elements
      this._cleanDocument(doc);
      
      // Get the main content
      const mainContent = this._findMainContent(doc);
      
      // Convert to a container element
      const contentContainer = doc.createElement('div');
      contentContainer.innerHTML = mainContent;
      
      // Clean up the content
      this._cleanContent(contentContainer);
      
      return contentContainer.innerHTML;
    },

    /**
     * Clean up the document by removing scripts, styles, and other non-content elements
     * @param {Document} doc - The document to clean
     */
    _cleanDocument: function(doc) {
      const elementsToRemove = [
        'script', 'style', 'iframe', 'noscript', 'object', 'embed', 'form',
        'footer', 'nav', 'aside', 'button', 'svg', 'canvas'
      ];
      
      // Remove unwanted elements
      elementsToRemove.forEach(tagName => {
        const elements = doc.getElementsByTagName(tagName);
        while (elements.length > 0) {
          elements[0].parentNode.removeChild(elements[0]);
        }
      });
      
      // Remove class attributes that might indicate advertisements or non-content
      const elementsWithClasses = doc.querySelectorAll('[class]');
      for (let i = 0; i < elementsWithClasses.length; i++) {
        const element = elementsWithClasses[i];
        const className = element.className.toLowerCase();
        
        // Check for common ad and non-content class patterns
        if (
          className.includes('ad') ||
          className.includes('banner') ||
          className.includes('menu') ||
          className.includes('navigation') ||
          className.includes('sidebar') ||
          className.includes('footer') ||
          className.includes('comment') ||
          className.includes('social')
        ) {
          // Just remove the class, not the element, as it might contain content
          element.removeAttribute('class');
        }
      }
    },

    /**
     * Find the main content of the article
     * @param {Document} doc - The document to search
     * @return {string} The main content as HTML
     */
    _findMainContent: function(doc) {
      // Look for common article container elements
      const articleSelectors = [
        'article',
        '[role="article"]',
        '[itemtype*="Article"]',
        '.post-content',
        '.article-content',
        '.article-body',
        '.entry-content',
        '.content-article',
        '.content-body',
        '.article',
        '#article'
      ];
      
      // Try each selector
      for (let i = 0; i < articleSelectors.length; i++) {
        const elements = doc.querySelectorAll(articleSelectors[i]);
        if (elements.length === 1) {
          return elements[0].innerHTML;
        }
        
        // If multiple elements match, choose the one with the most content
        if (elements.length > 1) {
          let bestElement = elements[0];
          let bestLength = this._getTextLength(elements[0]);
          
          for (let j = 1; j < elements.length; j++) {
            const length = this._getTextLength(elements[j]);
            if (length > bestLength) {
              bestElement = elements[j];
              bestLength = length;
            }
          }
          
          return bestElement.innerHTML;
        }
      }
      
      // If we couldn't find a clear article container, look for all paragraphs
      // and determine the best content block by density
      return this._findContentByDensity(doc);
    },

    /**
     * Find content by paragraph density
     * @param {Document} doc - The document to analyze
     * @return {string} The content HTML
     */
    _findContentByDensity: function(doc) {
      const paragraphs = doc.getElementsByTagName('p');
      
      if (paragraphs.length === 0) {
        // No paragraphs found, return the body content
        return doc.body.innerHTML;
      }
      
      // Group paragraphs by their parent element
      const parentCounts = {};
      
      for (let i = 0; i < paragraphs.length; i++) {
        const parent = paragraphs[i].parentNode;
        const parentId = parent.tagName + (parent.id ? '#' + parent.id : '') + 
                         (parent.className ? '.' + parent.className.replace(/\s+/g, '.') : '');
        
        if (!parentCounts[parentId]) {
          parentCounts[parentId] = {
            element: parent,
            count: 0,
            textLength: 0
          };
        }
        
        parentCounts[parentId].count++;
        parentCounts[parentId].textLength += this._getTextLength(paragraphs[i]);
      }
      
      // Find the parent with the most paragraph text
      let bestParent = null;
      let bestTextLength = 0;
      
      for (const parentId in parentCounts) {
        const info = parentCounts[parentId];
        if (info.count >= 3 && info.textLength > bestTextLength) {
          bestParent = info.element;
          bestTextLength = info.textLength;
        }
      }
      
      if (bestParent) {
        return bestParent.innerHTML;
      }
      
      // If no good parent is found, just take the main content area of the page
      const mainContent = doc.querySelector('main') || doc.querySelector('#main') || doc.querySelector('.main-content');
      
      if (mainContent) {
        return mainContent.innerHTML;
      }
      
      // Fallback to the body content
      return doc.body.innerHTML;
    },

    /**
     * Get the length of text in an element
     * @param {Element} element - The element to measure
     * @return {number} The text length
     */
    _getTextLength: function(element) {
      return element.textContent.trim().length;
    },

    /**
     * Clean up the content by removing empty elements and attributes
     * @param {Element} contentContainer - The container element to clean
     */
    _cleanContent: function(contentContainer) {
      // Remove empty elements
      const elementsToCheck = contentContainer.querySelectorAll('*');
      for (let i = elementsToCheck.length - 1; i >= 0; i--) {
        const element = elementsToCheck[i];
        if (element.textContent.trim() === '' && !this._isMediaElement(element)) {
          element.parentNode.removeChild(element);
        }
      }
      
      // Remove unnecessary attributes
      const elementsWithAttributes = contentContainer.querySelectorAll('*');
      for (let i = 0; i < elementsWithAttributes.length; i++) {
        const element = elementsWithAttributes[i];
        const attributesToKeep = ['src', 'href', 'alt', 'title'];
        
        for (let j = element.attributes.length - 1; j >= 0; j--) {
          const attrName = element.attributes[j].name;
          if (!attributesToKeep.includes(attrName)) {
            element.removeAttribute(attrName);
          }
        }
      }
    },

    /**
     * Check if an element is a media element (image, video, audio)
     * @param {Element} element - The element to check
     * @return {boolean} True if it's a media element
     */
    _isMediaElement: function(element) {
      const mediaElements = ['img', 'video', 'audio', 'picture', 'svg', 'canvas', 'figure'];
      return mediaElements.includes(element.tagName.toLowerCase());
    }
  };

  // Expose the Readability constructor
  global.Readability = Readability;
})(this);
