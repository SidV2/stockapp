import { Injectable } from '@angular/core';
import { Observable, filter, map, retry, shareReplay } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { apiBaseUrl } from '../../constants/api.constants';

export interface StockQuoteMessage {
  type: 'stockQuote';
  symbol: string;
  data: {
    price: number;
    timestamp: number;
  };
}

export interface QuoteUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class QuoteStreamService {
  private socket?: WebSocketSubject<StockQuoteMessage>;

  /**
   * Connect to the quote stream for a symbol. A new symbol will close the previous connection.
   */
  public stream(symbol: string): Observable<QuoteUpdate> {
    this.socket?.complete();
    this.socket = webSocket<StockQuoteMessage>(this.buildUrl(symbol));
    return this.socket.pipe(
      filter((message) => message.type === 'stockQuote'),
      map((message) => ({
        symbol: message.symbol,
        price: message.data.price,
        timestamp: message.data.timestamp,
      })),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private buildUrl(symbol: string): string {
    const wsBase = apiBaseUrl.replace(/^http/, 'ws');
    return `${wsBase}/ws/quotes?symbol=${encodeURIComponent(symbol)}`;
  }
}
