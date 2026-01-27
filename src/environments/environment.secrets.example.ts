/**
 * OpenAI Configuration
 *
 * SETUP:
 * 1. Copy this file: cp environment.secrets.example.ts environment.secrets.ts
 * 2. The API key goes in .env file (OPENAI_API_KEY=your-key)
 * 3. Run proxy server: npm run proxy
 */

export const openAiConfig = {
  model: 'gpt-3.5-turbo' // or 'gpt-4' for better quality
};
