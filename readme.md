# Summarize

**Summarize** is a [Chrome browser extension](https://developer.chrome.com/docs/extensions/) that summarizes web articles using [OpenAI's API](https://www.npmjs.com/package/openai) and [Mozilla's Readability parser](https://www.npmjs.com/package/@mozilla/readability). It requires you **to provide your own** [OpenAI API key](https://platform.openai.com/settings/organization/api-keys).

## Installation

Download and install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/article-summarizer-with-o/djaflgohpgojbjelpdhpkopnjeimgikk).

## Setup

Launch the extension to open the settings, set your OpenAI API key, choose the desired model, and optionally edit the prompt.

## Usage

Launch the extension to summarize the current article using OpenAI. For convenience, set a keyboard shortcut (`chrome://extensions/shortcuts`), e.g., `^S`, to quickly launch the extension.

## Local Installation

Clone the repository and run:

```shell
yarn install
yarn build
```

Open the Extensions (`chrome://extensions/`) page in your browser, enable **Developer mode** (top-right corner), click **Load unpacked** (top-left corner), navigate to the `summarize/release` folder in this repository, and select it.

## Privacy Statement

**Summarize** collects **no user data**.
