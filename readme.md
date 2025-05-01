# Summarize

Summarize is a [Chrome Browser Extension](https://developer.chrome.com/docs/extensions/) that summarizes web articles using [OpenAI's API](https://www.npmjs.com/package/openai) and [Mozilla's Readability parser](https://www.npmjs.com/package/@mozilla/readability). It requires you use your own [OpenAI API key](https://platform.openai.com/settings/organization/api-keys).

# Install

Clone repository, run `npm install`, and `npm run build`.

Open the [Extensions](chrome://extensions/) page in your browser, enable "Developer mode" from top right, click "Load unpacked" from top left, navigate to this repos `summarize/release` -folder and click "Select".

# Setup

Launch the extension to open the settings and set your OpenAI API key, select the model, and edit the prompt if needed.

# Using

Launch the extension and it'll send the article to OpenAI to be summarized.

# Privacy Statement

Summarize extension collects zero data from its users.
