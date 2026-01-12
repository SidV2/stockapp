# OpenAI API Setup Guide

## The Problem

OpenAI's API **blocks direct browser requests** due to CORS (Cross-Origin Resource Sharing) security policy. This means you can't call OpenAI directly from your Angular app.

### Error You'll See:
```
Access to XMLHttpRequest at 'https://api.openai.com/v1/chat/completions' 
from origin 'http://localhost:4200' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

## ✅ Solutions (Choose One)

### **Option 1: Use Fallback Mode (Current - Works Immediately)**

✅ **Pros**: Works now, no setup, free  
❌ **Cons**: Uses heuristics instead of AI

**Status**: Already configured! The app is using smart heuristics that analyze:
- Price momentum
- Volume patterns  
- Valuation metrics (P/E ratio)
- 52-week positioning

**Result**: You'll see signals like "BUY", "SELL", "HOLD" with confidence scores based on technical analysis.

---

### **Option 2: Backend Proxy Server (Recommended for OpenAI)**

✅ **Pros**: Uses real OpenAI, proper architecture  
❌ **Cons**: Need to run separate server

#### Setup Steps:

1. **Install Dependencies**
   ```bash
   npm install express cors dotenv
   ```

2. **Create .env File** (in project root)
   ```bash
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   ```

3. **Start the Proxy Server** (new terminal)
   ```bash
   node scripts/ai-proxy-server.js
   ```
   
   You should see:
   ```
   🚀 AI Proxy Server running on http://localhost:3001
   📡 Proxying requests to OpenAI API
   🔑 API Key: ✓ Configured
   ```

4. **Update AI Service** (modify `ai-stock-analyzer.service.ts`)
   
   Change the OpenAI method to use your proxy:
   ```typescript
   private analyzeWithOpenAI(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
     // Use local proxy instead of direct OpenAI
     return this.http.post<StockAnalysis>('http://localhost:3001/api/analyze', {
       prompt: prompt,
       model: secrets.openai.model
     }).pipe(
       catchError(error => {
         console.error('Proxy Error:', error);
         return of(this.getFallbackAnalysis(stockDetail));
       })
     );
   }
   ```

5. **Enable OpenAI in Config**
   ```typescript
   // src/environments/environment.secrets.ts
   export const AI_PROVIDER = 'openai';
   ```

6. **Test It!**
   - Navigate to any stock page (e.g., /stock/AAPL)
   - Watch the proxy server logs
   - See AI analysis appear!

---

### **Option 3: Google Gemini API (Browser-Friendly)**

✅ **Pros**: Works from browser, free tier available  
❌ **Cons**: Different API format

#### Quick Setup:

1. **Get API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Configure** (`environment.secrets.ts`)
   ```typescript
   export const secrets = {
     gemini: {
       apiKey: 'AIza-your-key-here',
       model: 'gemini-pro'
     }
   };
   
   export const AI_PROVIDER = 'gemini';
   ```

3. **Done!** Gemini works directly from browser.

**Free Tier**: 60 requests per minute!

---

## Current Status

✅ **API Key**: Configured correctly  
✅ **App**: Running on http://localhost:4200  
✅ **Mode**: Fallback (heuristics)  
⏸️ **OpenAI**: Needs proxy server (see Option 2)

## Testing Your Setup

### Test Fallback Mode (Current)
1. Go to http://localhost:4200/stock/AAPL
2. You should see "AI Trading Signal" card
3. Analysis uses heuristics (no API call)

### Test Proxy Server
```bash
# In separate terminal
node scripts/ai-proxy-server.js

# Test health endpoint
curl http://localhost:3001/health
```

## Cost Estimates

| Provider | Cost per Analysis | Free Tier |
|----------|------------------|-----------|
| **Fallback** | **FREE** | Unlimited |
| GPT-3.5-Turbo | $0.001-0.002 | $5 credit |
| GPT-4 | $0.015-0.030 | $5 credit |
| Gemini Pro | $0.001-0.002 | 60/min free |

## Troubleshooting

### "API key not working"
- ✅ Check you created `.env` file (not `.env.example`)
- ✅ No spaces around the `=` sign
- ✅ Restart proxy server after changing .env

### "CORS error"
- ❌ Can't fix - OpenAI blocks browsers
- ✅ Use proxy server (Option 2)
- ✅ OR use Gemini (Option 3)
- ✅ OR use fallback (current)

### "Connection refused"
- Check proxy server is running
- Check it's on port 3001
- Check `curl http://localhost:3001/health`

### "401 Unauthorized"
- API key might be invalid
- Check OpenAI account has billing set up
- Verify key hasn't been revoked

## Security Notes

🔒 **Important**:
1. ✅ `.env` file is in `.gitignore` - good!
2. ✅ `environment.secrets.ts` is in `.gitignore` - good!
3. ⚠️ **Rotate your API key** after sharing in chat
4. ⚠️ Never commit API keys to git
5. ⚠️ For production, use environment variables

## Next Steps

**For Development** (current):
- ✅ Keep using fallback mode
- ✅ It works great for testing!

**For Real AI** (when ready):
1. Choose proxy server (Option 2) or Gemini (Option 3)
2. Follow setup steps above
3. Update `AI_PROVIDER` setting
4. Test on a stock page

**For Production**:
1. Deploy proxy server (Vercel, AWS, etc.)
2. Use environment variables
3. Add rate limiting
4. Monitor API usage

---

Need help? Check:
- Component README: `src/app/components/stock-signal-advisor/README.md`
- Usage Guide: `src/app/components/stock-signal-advisor/USAGE.md`
- Main Docs: `STOCK-SIGNAL-ADVISOR.md`
