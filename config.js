// Configuration file for development environment
// This file is not included in the extension package

// Store your OpenAI API key here for development
const CONFIG = {
  // NOTE: The actual API key has been provided through the environment
  // For local development, replace this with your actual OpenAI API key
  OPENAI_API_KEY: '' // The real key is available in the environment but not hardcoded here for security
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}