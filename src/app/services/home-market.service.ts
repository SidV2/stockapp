import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StockResult } from '../models';

const BASE_RESULTS: StockResult[] = [
  {
    symbol: 'AAPL',
    company: 'Apple Inc.',
    price: 226.34,
    changePercent: 1.12,
    changeValue: 2.52
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft Corp.',
    price: 452.16,
    changePercent: 0.48,
    changeValue: 2.18
  },
  {
    symbol: 'NVDA',
    company: 'NVIDIA Corp.',
    price: 128.17,
    changePercent: -0.65,
    changeValue: -0.83
  },
  {
    symbol: 'AMZN',
    company: 'Amazon.com Inc.',
    price: 196.42,
    changePercent: 0.91,
    changeValue: 1.77
  },
  {
    symbol: 'GOOGL',
    company: 'Alphabet Inc. (Class A)',
    price: 183.51,
    changePercent: -0.14,
    changeValue: -0.26
  },
  {
    symbol: 'TSLA',
    company: 'Tesla Inc.',
    price: 248.09,
    changePercent: 1.37,
    changeValue: 3.35
  }
];

@Injectable({ providedIn: 'root' })
export class HomeMarketService {
  private readonly results = this.withHighlight(BASE_RESULTS);

  getResults(): Observable<StockResult[]> {
    return of(this.results);
  }

  getAsOf(): Observable<number> {
    return of(Date.now());
  }

  private withHighlight(results: StockResult[]): StockResult[] {
    const highlight = results.reduce<StockResult | null>((candidate, item) => {
      if (!candidate) return item;
      return Math.abs(item.changePercent) > Math.abs(candidate.changePercent) ? item : candidate;
    }, null);
    const highlightSymbol = highlight?.symbol;
    return results.map((result) => ({
      ...result,
      highlight: highlightSymbol ? result.symbol === highlightSymbol : result.highlight
    }));
  }
}
