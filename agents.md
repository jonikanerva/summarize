# Guidelines for AI Coding Agents

This repository contains a Chrome extension that summarizes web articles using OpenAI's API and Mozilla's Readability parser.

## Repository layout

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

## Setup and build

1. Install dependencies with `yarn install`.
2. Run `yarn build` to lint with Prettier and bundle the extension into the `release/` directory.
3. Load the `release/` directory as an unpacked extension in Chrome.

`yarn lint` runs Prettier checks. Prettier is configured with `semi: false` and `singleQuote: true`.

## Contribution guidelines

- Use ES modules and follow the existing code style.
- Run `yarn lint` before committing.
- Keep the manifest and version numbers in sync when releasing updates.
- Do not commit API keys or other secrets.
