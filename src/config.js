// Default settings
export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gpt-4.1',
  promptTemplate: `Summarize the provided content comprehensively and accurately, ensuring no key details are omitted.

Start by generating a good title for the article stating what the text is about objectively, followed by the byline who is the author(s) of the article and date written.

Then create a bulleted list of the objective facts and key points, followed by a bulleted list of the author’s opinions.

Then write an assessment of whether the article provides sources for its facts, comment on the reliability of those sources, and/or the reputation of the author.

Conclude with a one-paragraph summary of the whole article.

Here is the article content:

{{ARTICLE_TEXT}}`,
  allowWebSearchCheckbox: true,
}

export const DEFAULT_OUTPUT =
  'Please structure your response using only proper HTML formatting, using only elements <H1>, <H2>, <UL>, <LI>, <P>, and <A>.'
