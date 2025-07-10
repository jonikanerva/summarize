# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `yarn build` - Full build process: lints, cleans, builds, and packages the extension
- `yarn lint` - Check code formatting with Prettier
- `yarn clean` - Remove the release directory
- `yarn parcel` - Build extension files to release/ directory
- `yarn zip` - Package built extension into summarize.zip

Always run `yarn build` before testing changes. The extension loads from the `release/` directory.

## Extension Architecture

This Chrome extension uses Manifest V3 with a service worker architecture:

### Core Flow

1. **User activation**: Extension icon click → checks API key → injects content script → opens summary tab
2. **Content extraction**: Content script uses Mozilla Readability to parse article content from active tab
3. **AI processing**: Background script sends structured messages to OpenAI Responses API
4. **Follow-up conversations**: Summary page supports follow-up questions with conversation memory

### Key Components

**Background Script (`src/background.js`)**

- Service worker managing API communication and extension state
- `summarizeWithOpenAI()` function uses OpenAI Responses API with messages array format
- Handles conversation continuity via `previous_response_id` and `store: true`
- Supports web search through `tools: [{ type: 'web_search_preview' }]`

**Content Script (`src/content.js`)**

- Injected into web pages to extract article content
- Uses `@mozilla/readability` library for robust article parsing
- Returns structured data: title, content, byline, publishedTime

**Configuration (`src/config.js`)**

- `DEFAULT_SETTINGS`: API key, model, prompt template, web search settings
- `DEFAULT_OUTPUT`: System prompt for HTML-only responses using specific tags

### UI Components

**Summary Page (`html/summary.html` + `src/summary.js`)**

- Displays article summary with floating follow-up input at bottom
- Manages conversation state with `currentResponseId` for follow-up questions
- Uses DOMPurify for HTML sanitization
- Keyboard shortcuts: Cmd+Enter/Ctrl+Enter to submit follow-up questions

**Settings Page (`html/settings.html` + `src/settings.js`)**

- Manages OpenAI API key, model selection, prompt template
- Web search toggle for follow-up questions
- API key validation against OpenAI endpoints

## OpenAI API Integration

The extension uses OpenAI's **Responses API** (not Chat Completions API):

### Message Structure

```javascript
const messages = [
  { role: 'user', content: 'Article content or follow-up question' },
  { role: 'system', content: DEFAULT_OUTPUT }, // HTML formatting constraints
]
```

### Key Features

- **Conversation Memory**: `store: true` and `previous_response_id` for follow-up context
- **Web Search**: Optional `tools: [{ type: 'web_search_preview' }]` for enhanced responses
- **Response Format**: Enforced HTML-only output using `<h1>`, `<h2>`, `<ul>`, `<li>`, `<p>`, `<a>` tags

## Development Notes

### State Management

- Settings stored in Chrome sync storage
- Conversation continuity maintained through OpenAI response IDs
- No manual conversation history tracking (handled by OpenAI API)

### Content Security

- DOMPurify sanitizes all HTML content before rendering
- API keys stored locally in Chrome storage
- No user data collection or external tracking

### Extension Permissions

- `activeTab`: Access current tab content
- `storage`: Store settings and API keys
- `scripting`: Inject content scripts
- `https://api.openai.com/*`: API access

### Code Style

- ES modules with Prettier formatting
- Async/await patterns for API calls
- Chrome extension message passing for component communication
- Use functional programming best practies, i.e. no mutations, pure fuctions if possible
