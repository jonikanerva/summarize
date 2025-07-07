# Summarize Extension Specification

## Overview

**Summarize** is a Chrome browser extension that extracts and summarizes web articles using OpenAI's API and Mozilla's Readability parser. The extension requires users to provide their own OpenAI API key.

## Architecture

### Repository layout

- `src/` – JavaScript sources for the extension
  - `background.js` handles events and API requests
  - `content.js` extracts article text in the browser
  - `settings.js` manages the options page
  - `summary.js` manages the generated summary
  - `config.js` for defining shared extension configurations
- `html/` – HTML for the settings and summary pages
  - `summary.html` displays the generated summary
  - `settings.html` displays the options page
- `css/` – CSS for the settings and summary pages
  - `common.css` - common CSS shared between pages
  - `settings.css` - CSS for the settings page
  - `summary.css` - CSS for the summary page
- `icons/*` – PNG files used as extension icons
- `manifest.json` – Chrome extension manifest

### Core Components

#### 1. Background Script (`src/background.js`)

- **Purpose**: Service worker that manages extension state and API communication
- **Key Functions**:
  - `summarizeWithOpenAI()`: Handles OpenAI API requests with configurable model and temperature
  - Extension initialization with default settings
  - Message handling for content scripts and UI components
  - Settings management (get/update API key, model, prompt template)

#### 2. Content Script (`src/content.js`)

- **Purpose**: Injected into web pages to extract article content
- **Key Functions**:
  - `extractArticleContent()`: Uses Mozilla Readability to parse article content
  - Returns structured article data (title, content, byline, publishedTime)
  - Fallback error handling for non-article pages

#### 3. Configuration (`src/config.js`)

- **Purpose**: Stores default settings and prompt templates

### User Interface

#### Settings Page (`html/settings.html`)

- Configure OpenAI API key
- Select AI model
- Customize prompt template
- Accessible via extension options or when API key is missing

#### Summary Page (`html/summary.html`)

- Displays extracted and summarized article content
- Opens in new tab when extension is activated
- Shows structured summary with facts, opinions, and source assessment

## Permissions & Security

### Chrome Extension Permissions

- `activeTab`: Access current tab content
- `storage`: Store user settings and API keys
- `scripting`: Inject content scripts
- `https://api.openai.com/*`: Make API requests to OpenAI

### Privacy

- No user data collection
- API key stored locally in Chrome storage
- Article content sent only to OpenAI API

## Workflow

1. **User clicks extension icon**
2. **API key validation**: Redirects to settings if not configured
3. **Content injection**: Injects content script into active tab
4. **Article extraction**: Uses Readability to parse article content
5. **Summary generation**: Sends content to OpenAI API with custom prompt
6. **Result display**: Opens summary page with structured output

## Technical Specifications

### Dependencies

- `@mozilla/readability`: Article content extraction
- `openai`: OpenAI API client
- `dompurify`: HTML sanitization
- `parcel`: Build system for web extensions

### Build Process

```bash
yarn lint      # Code formatting check
yarn clean     # Remove release directory
yarn parcel    # Build extension files
yarn zip       # Package for distribution
```

### Contribution guidelines

- Use ES modules and follow the existing code style.
- Run `yarn lint` before committing.
- Keep the manifest and version numbers in sync when releasing updates.
- Do not commit API keys or other secrets.

### Output Format

Summaries include:

- Article title and metadata
- Bulleted list of objective facts
- Bulleted list of author opinions
- Source reliability assessment
- One-paragraph summary
- Structured HTML formatting (`<H1>`, `<H2>`, `<UL>`, `<LI>`, `<P>`)

### Error Handling

- Missing API key detection
- Non-article page detection
- API request failure handling
- Content extraction failures

## Installation & Distribution

### Chrome Web Store

- Published extension ID: `djaflgohpgojbjelpdhpkopnjeimgikk`

### Local Development

1. Clone repository
2. Run `yarn install && yarn build`
3. Load unpacked extension from `release/` directory

## Configuration Options

### Models

- Configurable through settings UI

### Prompt Template

- Customizable template with `{{ARTICLE_TEXT}}` placeholder
- Default focuses on objective facts vs. opinions
- HTML-structured output format
