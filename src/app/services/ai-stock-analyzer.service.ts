import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StockDetail } from '../models/stock.models';
import { secrets, AI_PROVIDER } from '../../environments/environment.secrets';

export interface StockAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-100
  reasoning: string;
  keyFactors: string[];
  targetPrice?: number;
  timeHorizon: 'short-term' | 'medium-term' | 'long-term';
  riskLevel: 'Low' | 'Medium' | 'High';
}

@Injectable({
  providedIn: 'root'
})
export class AiStockAnalyzerService {
  private readonly aiProvider = AI_PROVIDER;

  constructor(private http: HttpClient) {}

  analyzeStock(stockDetail: StockDetail): Observable<StockAnalysis> {
    // Use fallback analysis if no AI provider is configured
    if (this.aiProvider === 'fallback') {
      console.info('Using fallback heuristic analysis. Configure AI provider in environment.secrets.ts for AI-powered analysis.');
      return of(this.getFallbackAnalysis(stockDetail));
    }

    const prompt = this.buildAnalysisPrompt(stockDetail);

    switch (this.aiProvider) {
      case 'openai':
        return this.analyzeWithOpenAI(prompt, stockDetail);
      case 'anthropic':
        return this.analyzeWithAnthropic(prompt, stockDetail);
      case 'gemini':
        return this.analyzeWithGemini(prompt, stockDetail);
      default:
        return of(this.getFallbackAnalysis(stockDetail));
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
      catchError(error => {
        console.error('❌ OpenAI Proxy Error:', error);
        if (error.status === 0) {
          console.warn('⚠️ Proxy server not running. Start it with: node scripts/ai-proxy-server.js');
        }
        console.log('↩️ Falling back to heuristic analysis');
        return of(this.getFallbackAnalysis(stockDetail));
      })
    );
  }

  private analyzeWithAnthropic(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
    if (!secrets.anthropic.apiKey) {
      console.warn('Anthropic API key not configured. Using fallback analysis.');
      return of(this.getFallbackAnalysis(stockDetail));
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
      catchError(error => {
        console.error('Anthropic Analysis Error:', error);
        return of(this.getFallbackAnalysis(stockDetail));
      })
    );
  }

  private analyzeWithGemini(prompt: string, stockDetail: StockDetail): Observable<StockAnalysis> {
    if (!secrets.gemini.apiKey) {
      console.warn('Gemini API key not configured. Using fallback analysis.');
      return of(this.getFallbackAnalysis(stockDetail));
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
      catchError(error => {
        console.error('Gemini Analysis Error:', error);
        return of(this.getFallbackAnalysis(stockDetail));
      })
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

  private getFallbackAnalysis(stock: StockDetail): StockAnalysis {
    // Simple heuristic-based fallback when AI is not available
    const priceChange = stock.changePercent * 100;
    const volumeRatio = stock.avgVolume > 0 ? stock.volume / stock.avgVolume : 1;
    const fiftyTwoWeekPosition = ((stock.price - stock.week52Range[0]) / (stock.week52Range[1] - stock.week52Range[0])) * 100;
    
    let score = 0;
    const factors: string[] = [];

    // Price momentum
    if (priceChange > 2) {
      score += 2;
      factors.push('Strong positive momentum');
    } else if (priceChange > 0) {
      score += 1;
      factors.push('Positive momentum');
    } else if (priceChange < -2) {
      score -= 2;
      factors.push('Strong negative momentum');
    } else if (priceChange < 0) {
      score -= 1;
      factors.push('Negative momentum');
    }

    // Volume analysis
    if (volumeRatio > 1.5) {
      score += 1;
      factors.push('High trading volume');
    } else if (volumeRatio < 0.5) {
      score -= 1;
      factors.push('Low trading volume');
    }

    // 52-week position
    if (fiftyTwoWeekPosition > 80) {
      score -= 1;
      factors.push('Near 52-week high (potential resistance)');
    } else if (fiftyTwoWeekPosition < 20) {
      score += 1;
      factors.push('Near 52-week low (potential support)');
    }

    // P/E Ratio analysis
    if (stock.peRatio > 0 && stock.peRatio < 15) {
      score += 1;
      factors.push('Attractive P/E ratio');
    } else if (stock.peRatio > 30) {
      score -= 1;
      factors.push('High P/E ratio (potentially overvalued)');
    }

    let signal: 'BUY' | 'SELL' | 'HOLD';
    let confidence: number;
    let reasoning: string;

    if (score >= 2) {
      signal = 'BUY';
      confidence = Math.min(70 + (score * 5), 85);
      reasoning = 'Multiple positive indicators suggest potential upside. Consider entering a position with proper risk management.';
    } else if (score <= -2) {
      signal = 'SELL';
      confidence = Math.min(70 + (Math.abs(score) * 5), 85);
      reasoning = 'Multiple negative indicators suggest potential downside. Consider reducing exposure or waiting for better entry points.';
    } else {
      signal = 'HOLD';
      confidence = 60;
      reasoning = 'Mixed signals in the current market conditions. Wait for clearer directional indicators before taking action.';
    }

    return {
      signal,
      confidence,
      reasoning,
      keyFactors: factors.length > 0 ? factors : ['Neutral market conditions'],
      timeHorizon: 'short-term',
      riskLevel: Math.abs(score) > 3 ? 'High' : Math.abs(score) > 1 ? 'Medium' : 'Low'
    };
  }
}
