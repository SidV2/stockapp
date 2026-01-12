# Stock Signal Advisor - Usage Guide

## Quick Setup (2 minutes)

### Step 1: Add API Key

Edit `src/environments/environment.secrets.ts`:

```typescript
export const secrets = {
  openai: {
    apiKey: 'sk-proj-your-actual-key-here',  // 👈 Add your OpenAI key
    model: 'gpt-4'
  }
};

export const AI_PROVIDER = 'openai';  // 👈 Set to 'openai'
```

### Step 2: Start the App

```bash
ng serve
```

### Step 3: Visit Any Stock

Navigate to any stock detail page:
- http://localhost:4200/stock/AAPL
- http://localhost:4200/stock/TSLA
- http://localhost:4200/stock/MSFT

You'll see the AI advisor card at the top! 🎉

## Alternative: No API Setup (Fallback Mode)

Don't want to set up an API? No problem!

In `src/environments/environment.secrets.ts`:

```typescript
export const AI_PROVIDER = 'fallback';  // 👈 Use smart heuristics
```

The component will use intelligent heuristic analysis based on:
- Price momentum
- Volume patterns
- Valuation metrics
- 52-week positioning

## How to Get API Keys

### OpenAI (Recommended)

1. Go to https://platform.openai.com/signup
2. Sign up for an account
3. Add $5-10 credit at https://platform.openai.com/account/billing
4. Create API key at https://platform.openai.com/api-keys
5. Copy the key (starts with `sk-proj-...`)
6. Paste into `environment.secrets.ts`

**Cost**: ~$0.01-0.03 per analysis (GPT-4) or ~$0.001 per analysis (GPT-3.5-Turbo)

### Anthropic Claude

1. Go to https://console.anthropic.com/
2. Sign up and verify email
3. Go to API Keys section
4. Create new key
5. Copy key (starts with `sk-ant-...`)
6. Update `environment.secrets.ts`:

```typescript
export const secrets = {
  anthropic: {
    apiKey: 'sk-ant-your-key',
    model: 'claude-3-5-sonnet-20241022'
  }
};
export const AI_PROVIDER = 'anthropic';
```

### Google Gemini (Free Tier Available!)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Update `environment.secrets.ts`:

```typescript
export const secrets = {
  gemini: {
    apiKey: 'AIza-your-key',
    model: 'gemini-pro'
  }
};
export const AI_PROVIDER = 'gemini';
```

**Free tier**: 60 requests per minute!

## Component Features

### Visual Design

```
╔══════════════════════════════════════════════════╗
║  🤖 AI Trading Signal                    ↻       ║
║                                                  ║
║  ┌────────────────────────────────────────────┐ ║
║  │  📈  Strong Buy         ┌──────────┐       │ ║
║  │      AAPL               │   85%    │       │ ║
║  │                         │ Confidence│       │ ║
║  └─────────────────────────└──────────┘───────┘ ║
║                                                  ║
║  AI Analysis                                     ║
║  The stock shows strong bullish momentum...      ║
║                                                  ║
║  Key Factors                                     ║
║  ▸ Strong positive momentum (+3.2%)             ║
║  ▸ Above-average trading volume (1.4x)          ║
║  ▸ Attractive P/E ratio (24.5)                  ║
║                                                  ║
║  Time Horizon: Medium-term                       ║
║  Risk Level: 🟡 Medium                          ║
║  Target Price: $185.50                          ║
║                                                  ║
║  ⚠️ This analysis is for informational...       ║
╚══════════════════════════════════════════════════╝
```

### Signal Types

#### 📈 BUY Signal
- **Color**: Green glow
- **When**: Multiple positive indicators
- **Examples**: 
  - Strong upward momentum
  - High volume breakout
  - Undervalued fundamentals

#### 📉 SELL Signal
- **Color**: Red glow
- **When**: Multiple negative indicators
- **Examples**:
  - Downward trend
  - Weak volume
  - Overvalued metrics

#### ⏸️ HOLD Signal
- **Color**: Orange glow
- **When**: Mixed or neutral signals
- **Examples**:
  - Consolidation phase
  - Unclear direction
  - Balanced risk/reward

### Confidence Levels

- **75-100% (Green)**: High confidence - clear signals
- **50-74% (Yellow)**: Medium confidence - some uncertainty
- **0-49% (Red)**: Low confidence - mixed signals

### Time Horizons

- **Short-term**: Days to weeks (swing trading)
- **Medium-term**: Weeks to months (position trading)
- **Long-term**: Months to years (investing)

## Real-World Examples

### Example 1: Tech Growth Stock (AAPL)

**Scenario**: Apple at $150, up 2% today, strong volume

**AI Analysis**:
```
Signal: BUY
Confidence: 82%
Reasoning: Strong momentum, solid fundamentals, positive 
news flow. Recent product launches driving sentiment.
Key Factors:
- Positive price momentum
- Above-average volume
- Reasonable P/E ratio (28.5)
- Strong market position
Risk: Medium
Time Horizon: Medium-term
Target: $165
```

### Example 2: Volatile Stock (TSLA)

**Scenario**: Tesla at $200, down 5% today, high volume

**AI Analysis**:
```
Signal: HOLD
Confidence: 55%
Reasoning: High volatility with mixed signals. Recent 
decline on high volume but strong long-term trend. 
Wait for clearer direction.
Key Factors:
- Negative short-term momentum
- High volume (could be capitulation)
- High beta (1.8)
- Strong 52-week performance
Risk: High
Time Horizon: Short-term
```

### Example 3: Dividend Stock (KO)

**Scenario**: Coca-Cola at $60, flat, low volatility

**AI Analysis**:
```
Signal: BUY
Confidence: 70%
Reasoning: Stable dividend payer with consistent 
performance. Low risk profile suitable for income 
investors. Fair valuation.
Key Factors:
- Consistent dividend yield (3.2%)
- Low beta (0.6)
- Stable earnings
- Defensive sector
Risk: Low
Time Horizon: Long-term
Target: $65
```

## Troubleshooting

### "Using fallback heuristic analysis"

**Cause**: No API key configured or AI_PROVIDER set to 'fallback'

**Solution**: 
1. Get an API key from OpenAI/Anthropic/Gemini
2. Add to `environment.secrets.ts`
3. Set `AI_PROVIDER` to your chosen provider

### "Unable to analyze stock"

**Cause**: API error or network issue

**Solution**:
1. Check browser console for details
2. Verify API key is correct
3. Check API provider status page
4. Ensure API key has credit/quota

### CORS Errors

**Cause**: Some APIs may have CORS restrictions

**Solution**:
1. OpenAI, Anthropic, Gemini all support browser calls
2. If blocked, consider adding a backend proxy
3. Check API documentation for CORS settings

### Slow Analysis (>5 seconds)

**Cause**: Network latency or API server load

**Solution**:
1. Use faster model (GPT-3.5-Turbo instead of GPT-4)
2. Check internet connection
3. Try different time of day
4. Consider caching results

## Best Practices

### 1. Cache Results

Add caching to avoid repeated API calls:

```typescript
private analysisCache = new Map<string, { 
  result: StockAnalysis, 
  timestamp: number 
}>();

analyzeStock(): void {
  const cacheKey = this.stockDetail.symbol;
  const cached = this.analysisCache.get(cacheKey);
  
  // Use cache if less than 5 minutes old
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    this.analysis.set(cached.result);
    return;
  }
  
  // Otherwise make API call...
}
```

### 2. Rate Limiting

Prevent abuse with rate limiting:

```typescript
private lastAnalysisTime = 0;
private MIN_INTERVAL = 10000; // 10 seconds

analyzeStock(): void {
  const now = Date.now();
  if (now - this.lastAnalysisTime < this.MIN_INTERVAL) {
    return; // Too soon
  }
  this.lastAnalysisTime = now;
  // Continue with analysis...
}
```

### 3. Cost Monitoring

Track API usage:

```typescript
private analysisCount = 0;

analyzeStock(): void {
  this.analysisCount++;
  console.log(`Analysis count: ${this.analysisCount}`);
  // Continue...
}
```

### 4. Graceful Degradation

Always provide fallback:

```typescript
analyzeStock(): void {
  this.aiAnalyzer.analyzeStock(this.stockDetail).subscribe({
    next: (result) => this.analysis.set(result),
    error: (err) => {
      console.error('Analysis failed, using fallback:', err);
      // Fallback is handled in service automatically
    }
  });
}
```

## Security Checklist

- [ ] API key in `environment.secrets.ts` (not hardcoded)
- [ ] `environment.secrets.ts` in `.gitignore`
- [ ] Environment variables for production
- [ ] Rate limiting implemented
- [ ] API usage monitoring enabled
- [ ] No sensitive data in prompts
- [ ] HTTPS only in production

## Next Steps

1. **Test the component** with different stocks
2. **Monitor costs** in your AI provider dashboard
3. **Customize styling** to match your brand
4. **Add caching** to reduce API calls
5. **Implement analytics** to track usage
6. **Consider A/B testing** different prompts
7. **Add user feedback** mechanism

## Support

For issues or questions:
1. Check browser console for errors
2. Review component README.md
3. Test with fallback mode first
4. Verify API key configuration
5. Check API provider status pages

---

**Happy Trading! 📈🤖**

Remember: This is a tool to assist your research, not replace it. Always do your own due diligence!
