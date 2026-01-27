import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StockAnalysis, StockDetail } from '../models';
import { openAiConfig } from '../../environments/environment.secrets';

const PROXY_URL = 'http://localhost:3001/api/analyze';

@Injectable({ providedIn: 'root' })
export class AiStockAnalyzerService {
  constructor(private http: HttpClient) {}

  analyzeStock(stockDetail: StockDetail): Observable<StockAnalysis> {
    const prompt = this.buildAnalysisPrompt(stockDetail);

    return this.http.post<StockAnalysis>(PROXY_URL, {
      prompt,
      model: openAiConfig.model
    }).pipe(
      map(response => {
        console.log('OpenAI analysis received');
        return response;
      }),
      catchError((error: any) => {
        console.error('OpenAI Error:', error);

        let message = 'Failed to get AI analysis';
        if (error.status === 0) {
          message = 'Proxy server not running. Start it with: npm run proxy';
        } else if (error.status === 401) {
          message = 'Invalid OpenAI API key. Check your .env file';
        } else if (error.error?.error?.message) {
          message = error.error.error.message;
        }

        return throwError(() => new Error(message));
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
}
