import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StockAnalysis, StockDetail } from '../models';
import { secrets, AI_PROVIDER } from '../../environments/environment.secrets';

@Injectable({
  providedIn: 'root'
})
export class AiStockAnalyzerService {
  private readonly aiProvider = AI_PROVIDER;

  constructor(private http: HttpClient) {}

  analyzeStock(stockDetail: StockDetail): Observable<StockAnalysis> {
    // All providers require configuration now (no fallback mode)

    const prompt = this.buildAnalysisPrompt(stockDetail);

    switch (this.aiProvider) {
      case 'openai':
        return this.analyzeWithOpenAI(prompt, stockDetail);
      case 'anthropic':
        return this.analyzeWithAnthropic(prompt, stockDetail);
      case 'gemini':
        return this.analyzeWithGemini(prompt, stockDetail);
      default:
        return throwError(() => new Error('Invalid AI provider configured'));
    }
  }

  private analyzeWithOpenAI(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
    // Use local proxy server to bypass CORS restrictions
    const proxyUrl = 'http://localhost:3001/api/analyze';
    
    console.log('🤖 Sending request to OpenAI via proxy...');

    return this.http.post<StockAnalysis>(proxyUrl, {
      prompt: prompt,
      model: secrets.openai.model
    }).pipe(
      map(response => {
        console.log('✅ OpenAI analysis received');
        return response;
      }),
      this.handleAiError('OpenAI', (error) => {
        if (error.status === 0) {
          return 'Proxy server not running. Start it with: npm run proxy';
        } else if (error.status === 401) {
          return 'Invalid OpenAI API key. Please check your .env file';
        }
        return null; // Use default error message
      })
    );
  }

  private analyzeWithAnthropic(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
    if (!secrets.anthropic.apiKey) {
      return throwError(() => new Error('Anthropic API key not configured. Please add your key to environment.secrets.ts'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': secrets.anthropic.apiKey,
      'anthropic-version': '2023-06-01'
    });

    const body = {
      model: secrets.anthropic.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert financial analyst. ${prompt}\n\nRespond ONLY with valid JSON.`
        }
      ]
    };

    return this.http.post<any>('https://api.anthropic.com/v1/messages', body, { headers }).pipe(
      map(response => {
        const content = response.content[0].text;
        return JSON.parse(content) as StockAnalysis;
      }),
      this.handleAiError('Anthropic')
    );
  }

  private analyzeWithGemini(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
    if (!secrets.gemini.apiKey) {
      return throwError(() => new Error('Gemini API key not configured. Please add your key to environment.secrets.ts'));
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert financial analyst. ${prompt}\n\nRespond ONLY with valid JSON.`
            }
          ]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${secrets.gemini.model}:generateContent?key=${secrets.gemini.apiKey}`;

    return this.http.post<any>(url, body).pipe(
      map(response => {
        const content = response.candidates[0].content.parts[0].text;
        return JSON.parse(content) as StockAnalysis;
      }),
      this.handleAiError('Gemini')
    );
  }

  private buildAnalysisPrompt(stock: StockDetail): string {
    const priceChange = stock.changePercent * 100;
    const volumeRatio = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
    const fiftyTwoWeekPosition = ((stock.price - stock.week52Range[0]) / (stock.week52Range[1] - stock.week52Range[0])) * 100;

    return `Analyze the following stock and provide a trading signal (BUY, SELL, or HOLD):

Stock: ${stock.symbol} - ${stock.company}

CURRENT METRICS:
- Current Price: $${stock.price.toFixed(2)}
- Change Today: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%
- Previous Close: $${stock.previousClose.toFixed(2)}
- Open: $${stock.open.toFixed(2)}
- Day Range: $${stock.dayRange[0].toFixed(2)} - $${stock.dayRange[1].toFixed(2)}

VALUATION:
- Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${stock.peRatio.toFixed(2)}
${stock.dividendYield ? `- Dividend Yield: ${stock.dividendYield.toFixed(2)}%` : ''}
${stock.beta ? `- Beta: ${stock.beta.toFixed(2)}` : ''}

VOLUME ANALYSIS:
- Volume: ${(stock.volume / 1e6).toFixed(2)}M
- Average Volume: ${(stock.avgVolume / 1e6).toFixed(2)}M
- Volume Ratio: ${volumeRatio.toFixed(2)}x

52-WEEK ANALYSIS:
- 52-Week Range: $${stock.week52Range[0].toFixed(2)} - $${stock.week52Range[1].toFixed(2)}
- Current Position: ${fiftyTwoWeekPosition.toFixed(1)}% of 52-week range

COMPANY OVERVIEW:
${stock.description.substring(0, 300)}...

RECENT NEWS:
${stock.news.slice(0, 3).map((n, i) => `${i + 1}. ${n.title} (${n.source})`).join('\n')}

Provide your analysis in the following JSON format:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "confidence": <number between 0-100>,
  "reasoning": "<detailed explanation of your recommendation>",
  "keyFactors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "targetPrice": <optional number>,
  "timeHorizon": "short-term" | "medium-term" | "long-term",
  "riskLevel": "Low" | "Medium" | "High"
}`;
  }

  /**
   * Shared error handler for AI provider requests
   * @param provider - Name of the AI provider (for logging)
   * @param customErrorFn - Optional function to provide custom error messages based on error object
   */
  private handleAiError(
    provider: string,
    customErrorFn?: (error: any) => string | null
  ): (source: Observable<StockAnalysis>) => Observable<StockAnalysis> {
    return catchError((error: any) => {
      console.error(`❌ ${provider} Error:`, error);
      
      // Try custom error message first
      const customMessage = customErrorFn?.(error);
      
      // Fall back to standard error extraction
      const errorMessage = customMessage 
        || error.error?.error?.message 
        || error.error?.error 
        || `Failed to get AI analysis from ${provider}`;
      
      return throwError(() => new Error(errorMessage));
    });
  }
}
