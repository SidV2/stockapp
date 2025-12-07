import { Injectable } from '@angular/core';
import { Observable, retry, shareReplay } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { apiBaseUrl } from '../../constants/api.constants';
import { StockDetailUpdate } from '../models/stock.models';

@Injectable({ providedIn: 'root' })
export class QuoteStreamService {
  private socket?: WebSocketSubject<StockDetailUpdate>;

  /**
   * Connect to the quote stream for a symbol. A new symbol will close the previous connection.
   */
  public stream(symbol: string): Observable<StockDetailUpdate> {
    this.socket?.complete();
    this.socket = webSocket<StockDetailUpdate>(this.buildUrl(symbol));
    return this.socket.pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private buildUrl(symbol: string): string {
    const wsBase = apiBaseUrl.replace(/^http/, 'ws');
    return `${wsBase}/ws/quotes?symbol=${encodeURIComponent(symbol)}`;
  }
}
