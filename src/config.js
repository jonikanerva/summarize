// Default settings
export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4.1',
  promptTemplate: `Summarize the provided content comprehensively and accurately, ensuring no key details are omitted.

Start by generating a good title for the article stating what the text is about objectively, followed by the byline who is the author(s) of the article and date written (Author: X, Date: Y)

Then create a bulleted list of the objective facts and key points, followed by a bulleted list of the author’s opinions. Each bullet must express exactly one idea, with no other bullet having the same topic. Ensure that the most important points are at the top.

Then write an assessment of whether the article provides sources for its facts, comment on the reliability of those sources, and/or the reputation of the author.

Conclude with a one-paragraph summary of the whole article.

Here is the article content:

{{ARTICLE_TEXT}}`,
  allowWebSearchCheckbox: true,
}

export const DEFAULT_OUTPUT =
  'You are an assistant that must respond only with valid raw HTML5 using these tags: <h1>, <h2>, <ul>, <li>, <p>, <a>. No other tags, attributes, markdown fences, or plain text are allowed. The output must start with an <h1> or <p> and validate as HTML. If a link is needed, wrap it in <a href="...">anchor</a>.'
