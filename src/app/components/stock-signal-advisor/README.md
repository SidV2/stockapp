# Stock Signal Advisor Component

## Overview

The **Stock Signal Advisor** is an AI-powered component that analyzes stock data and provides actionable trading signals (BUY, SELL, or HOLD) with confidence levels and detailed reasoning.

## Features

- 🤖 **AI-Powered Analysis**: Integrates with multiple AI providers (OpenAI, Anthropic, Google Gemini)
- 📊 **Comprehensive Metrics**: Analyzes price trends, volume, valuation ratios, volatility, and more
- 🎯 **Clear Signals**: Provides BUY/SELL/HOLD recommendations with confidence scores
- 💡 **Detailed Reasoning**: Explains key factors behind each recommendation
- ⚡ **Fallback Analysis**: Uses heuristic-based analysis when AI is not configured
- 📱 **Responsive Design**: Beautiful gradient UI that works on all devices

## Configuration

### Step 1: Choose Your AI Provider

Edit `/src/environments/environment.secrets.ts`:

```typescript
// Choose which AI provider to use
export const AI_PROVIDER: 'openai' | 'anthropic' | 'gemini' | 'fallback' = 'openai';
```

### Step 2: Add API Key

Add your API key to the same file:

#### Option A: OpenAI (GPT-4)
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to `environment.secrets.ts`:

```typescript
export const secrets = {
  openai: {
    apiKey: 'sk-...', // Your OpenAI API key
    model: 'gpt-4' // or 'gpt-3.5-turbo' for lower cost
  }
};
```

#### Option B: Anthropic (Claude)
1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it to `environment.secrets.ts`:

```typescript
export const secrets = {
  anthropic: {
    apiKey: 'sk-ant-...', // Your Anthropic API key
    model: 'claude-3-5-sonnet-20241022'
  }
};
```

#### Option C: Google Gemini
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to `environment.secrets.ts`:

```typescript
export const secrets = {
  gemini: {
    apiKey: 'AIza...', // Your Google API key
    model: 'gemini-pro'
  }
};
```

#### Option D: Fallback (No API Required)
Set `AI_PROVIDER = 'fallback'` to use heuristic-based analysis without any AI API.

### Step 3: Secure Your Secrets

Add to `.gitignore`:
```
src/environments/environment.secrets.ts
```

## Usage

The component is automatically included in the stock detail page. It will:

1. **Automatically analyze** when a stock detail page loads
2. **Refresh** analysis when the user clicks the refresh button
3. **Display** a beautiful card with:
   - Trading signal (BUY/SELL/HOLD)
   - Confidence percentage
   - AI reasoning
   - Key factors
   - Risk level
   - Time horizon
   - Optional target price

## Analysis Criteria

The AI analyzes multiple factors:

### Price Metrics
- Current price and daily change
- Previous close and opening price
- Day range and 52-week range position

### Valuation
- Market capitalization
- P/E ratio
- Dividend yield
- Beta (volatility)

### Volume Analysis
- Current volume vs. average volume
- Volume trends

### Qualitative Factors
- Recent news sentiment
- Company description and sector
- Market conditions

## Fallback Heuristics

When AI is not configured, the component uses smart heuristics:

- **Price Momentum**: Recent price changes
- **Volume Analysis**: Trading volume vs. average
- **52-Week Position**: Near highs/lows
- **Valuation**: P/E ratio analysis
- **Score-based Decision**: Combines factors for signal

## Cost Considerations

### API Costs (Approximate)
- **OpenAI GPT-4**: $0.01-0.03 per analysis
- **OpenAI GPT-3.5-Turbo**: $0.001-0.002 per analysis
- **Anthropic Claude**: $0.015-0.025 per analysis
- **Google Gemini**: Free tier available, then $0.001-0.002
- **Fallback**: Free (no API calls)

### Optimization Tips
1. Use GPT-3.5-Turbo for cost savings
2. Implement caching (analysis valid for 5-15 minutes)
3. Use fallback for development/testing
4. Monitor API usage in your provider dashboard

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** in production
3. **Implement rate limiting** to prevent abuse
4. **Monitor API usage** to detect unauthorized access
5. **Rotate keys regularly**
6. **Use API key restrictions** (IP allowlists, domain restrictions)

## Customization

### Adjust Confidence Thresholds

Edit `stock-signal-advisor.component.ts`:

```typescript
readonly confidenceColor = computed(() => {
  const confidence = this.analysis()?.confidence ?? 0;
  if (confidence >= 75) return 'confidence--high';    // Adjust thresholds
  if (confidence >= 50) return 'confidence--medium';
  return 'confidence--low';
});
```

### Modify Styling

Edit `stock-signal-advisor.component.scss` to change:
- Colors and gradients
- Font sizes
- Animation effects
- Responsive breakpoints

### Change AI Prompt

Edit `ai-stock-analyzer.service.ts` in `buildAnalysisPrompt()` to:
- Add more metrics
- Change tone/style
- Focus on specific strategies
- Adjust response format

## Troubleshooting

### "AI API key not configured"
- Check that you've added your API key to `environment.secrets.ts`
- Verify the API key is valid and active
- Ensure the provider is set correctly

### "Unable to analyze stock"
- Check browser console for detailed errors
- Verify internet connection
- Check API provider status page
- Ensure API key has sufficient credits/quota

### CORS Errors
- Most AI APIs support direct browser calls
- If blocked, consider adding a backend proxy
- Check API documentation for CORS requirements

### Rate Limiting
- Implement caching in the service
- Add debouncing to the refresh button
- Consider using a backend service for production

## Disclaimer

⚠️ **Important**: This component provides analysis for informational purposes only and should not be considered as financial advice. Always:
- Conduct your own research
- Consult with a qualified financial advisor
- Understand the risks of trading
- Never invest more than you can afford to lose

The AI may make mistakes or provide incomplete analysis. Use this tool as one of many inputs in your investment decision process.

## License

Part of the Stock App project. See main LICENSE file for details.
