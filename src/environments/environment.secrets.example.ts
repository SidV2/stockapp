/**
 * Secret configuration for the application
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file: cp environment.secrets.example.ts environment.secrets.ts
 * 2. Add your actual API keys to the new file
 * 3. Never commit environment.secrets.ts to git!
 * 
 * DO NOT commit this file to version control with real keys!
 */

export const secrets = {
  // OpenAI API Configuration
  openai: {
    apiKey: 'your-openai-api-key-here', // Add your OpenAI API key here (get from https://platform.openai.com/api-keys)
    model: 'gpt-3.5-turbo' // or 'gpt-4' for better quality (more expensive)
  },

  // Alternative: Anthropic Claude API Configuration
  anthropic: {
    apiKey: '', // Add your Anthropic API key here (get from https://console.anthropic.com/)
    model: 'claude-3-5-sonnet-20241022'
  },

  // Alternative: Google Gemini API Configuration
  gemini: {
    apiKey: '', // Add your Google API key here (get from https://aistudio.google.com/app/apikey)
    model: 'gemini-pro'
  }
};

// Choose which AI provider to use: 'openai', 'anthropic', 'gemini', or 'fallback'
// 'fallback' uses heuristic analysis and requires no API key
export const AI_PROVIDER: 'openai' | 'anthropic' | 'gemini' | 'fallback' = 'fallback';
