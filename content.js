// Content script for article extraction and summary display

// Function to extract article content using Readability or fallback methods
function extractArticleContent() {
  try {
    console.log("Starting article extraction");

    // APPROACH 1: Try the direct selector method first (fastest and most reliable for many sites)
    try {
      console.log("Attempting direct selector method first");

      // Common article content selectors
      const selectors = [
        "article",
        '[role="article"]',
        ".article-content",
        ".post-content",
        ".entry-content",
        ".content",
        "#content",
        "main .article",
        ".main-content",
        ".article-body",
        ".story-body",
        '[itemprop="articleBody"]',
        ".post",
        ".story",
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
            const paragraphs = [
              ...element.querySelectorAll("p, h1, h2, h3, h4, h5, h6"),
            ]
              .map((node) => node.textContent.trim())
              .filter((text) => text.length > 0)
              .join("\n\n");

            if (paragraphs.length > 300) {
              return {
                title: document.title,
                content: paragraphs,
              };
            }

            // If not enough structured paragraphs, return all text
            return {
              title: document.title,
              content: text,
            };
          }
        }
      }

      console.log(
        "Direct selector method failed, no matching content-rich elements found"
      );
    } catch (selectorError) {
      console.warn("Error in direct selector method:", selectorError);
    }

    // APPROACH 2: Try Readability library
    try {
      console.log("Attempting Readability method");

      // Create a clone of the document to avoid modifying the original
      const documentClone = document.cloneNode(true);

      // Check if Readability is available
      if (typeof Readability === "undefined") {
        console.warn("Readability library not loaded");
        throw new Error("Readability not available");
      }

      // Create a new Readability object and parse
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (article && article.content && article.content.length > 200) {
        console.log("Successfully extracted content with Readability");

        // Get the text content from the parsed article
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = article.content;

        // Get all text nodes and join them
        const textContent = [
          ...tempDiv.querySelectorAll("p, h1, h2, h3, h4, h5, h6"),
        ]
          .map((node) => node.textContent.trim())
          .filter((text) => text.length > 0)
          .join("\n\n");

        if (textContent.length > 300) {
          return {
            title: article.title || document.title,
            content: textContent,
          };
        }
      }

      console.log("Readability method failed or returned insufficient content");
    } catch (readabilityError) {
      console.warn("Readability extraction failed:", readabilityError);
    }

    // APPROACH 3: Density-based approach - find block with highest paragraph density
    try {
      console.log("Attempting paragraph density approach");

      // Get all paragraphs
      const paragraphs = document.querySelectorAll("p");

      // Only proceed if we have enough paragraphs
      if (paragraphs.length >= 5) {
        // Count paragraphs by parent to find the densest container
        const parentCounts = {};

        for (const p of paragraphs) {
          const parent = p.parentNode;

          // Skip very short paragraphs
          if (p.textContent.trim().length < 20) continue;

          // Create unique identifier for the parent
          const key =
            parent.tagName +
            (parent.id ? `#${parent.id}` : "") +
            (parent.className ? `.${parent.className}` : "");

          if (!parentCounts[key]) {
            parentCounts[key] = {
              element: parent,
              count: 0,
              textLength: 0,
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
          console.log("Found best parent by paragraph density");
          const contentFromBestParent = [
            ...bestParent.querySelectorAll("p, h1, h2, h3, h4, h5, h6"),
          ]
            .map((node) => node.textContent.trim())
            .filter((text) => text.length > 0)
            .join("\n\n");

          if (contentFromBestParent.length > 300) {
            return {
              title: document.title,
              content: contentFromBestParent,
            };
          }
        }
      }

      console.log("Paragraph density approach failed");
    } catch (densityError) {
      console.warn("Error in paragraph density approach:", densityError);
    }

    // APPROACH 4: Find element with most text content
    try {
      console.log("Attempting most-text approach");

      // Find elements with a substantial amount of text
      const allElements = document.querySelectorAll(
        "div, section, article, main"
      );
      let bestElement = null;
      let mostTextLength = 0;

      for (const element of allElements) {
        // Skip elements that are likely not main content
        const className = (element.className || "").toLowerCase();
        const id = (element.id || "").toLowerCase();

        if (
          className.includes("nav") ||
          className.includes("menu") ||
          className.includes("header") ||
          className.includes("footer") ||
          className.includes("comment") ||
          className.includes("sidebar") ||
          id.includes("nav") ||
          id.includes("menu") ||
          id.includes("header") ||
          id.includes("footer") ||
          id.includes("comment") ||
          id.includes("sidebar")
        ) {
          continue;
        }

        const textLength = element.innerText.length;
        if (textLength > mostTextLength && textLength > 500) {
          mostTextLength = textLength;
          bestElement = element;
        }
      }

      if (bestElement && mostTextLength > 500) {
        console.log("Found element with most text");

        // Get paragraphs from the best element
        const bestParagraphs = [
          ...bestElement.querySelectorAll("p, h1, h2, h3, h4, h5, h6"),
        ]
          .map((node) => node.textContent.trim())
          .filter((text) => text.length > 0)
          .join("\n\n");

        if (bestParagraphs.length > 300) {
          return {
            title: document.title,
            content: bestParagraphs,
          };
        }

        // If not enough structured paragraphs, just use all text
        return {
          title: document.title,
          content: bestElement.innerText,
        };
      }

      console.log("Most-text approach failed");
    } catch (mostTextError) {
      console.warn("Error in most-text approach:", mostTextError);
    }

    // APPROACH 5: Last resort - use visible body text
    console.log("Using body text as last resort");

    // Get all visible text in the body
    const bodyText = document.body.innerText;
    if (bodyText.length > 1000) {
      // Try to remove navigation, header and footer content by taking the middle portion
      const startPos = Math.floor(bodyText.length * 0.1);
      const endPos = Math.floor(bodyText.length * 0.9);
      const trimmedText = bodyText.substring(startPos, endPos);

      return {
        title: document.title,
        content: trimmedText,
      };
    }

    // If we're here, we really couldn't find good content
    throw new Error("No substantial content found on this page");
  } catch (error) {
    console.error("Error extracting article content:", error);
    throw new Error(
      "Failed to extract article content. This may not be an article page or the content is not accessible."
    );
  }
}

// Add message listener for commands from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    try {
      const article = extractArticleContent();
      sendResponse({
        success: true,
        title: article.title,
        content: article.content,
      });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
});
