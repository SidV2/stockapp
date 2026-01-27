import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, filter, map, repeat, retry } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { apiBaseUrl } from '../../constants/api.constants';
import {
  ConnectionStatus,
  QuoteUpdate,
  StockQuoteMessage,
  WebSocketMessage
} from '../models/websocket.models';

// --- Configuration ---

const WS_CONFIG = {
  maxRetries: 10,
  baseRetryDelay: 1000,
  maxRetryDelay: 30000,
  reconnectDelay: 2000,
  subscribeInterval: 1000,
} as const;

@Injectable({ providedIn: 'root' })
export class QuoteStreamService {
  private socket?: WebSocketSubject<WebSocketMessage>;
  private readonly connectionStatus$ = new BehaviorSubject<ConnectionStatus>('disconnected');

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  stream(symbol: string): Observable<QuoteUpdate> {
    this.disconnect();

    return this.createSocket(symbol).pipe(
      filter((msg): msg is StockQuoteMessage => msg.type === 'stockQuote'),
      map(msg => ({
        symbol: msg.symbol,
        price: msg.data.price,
        timestamp: msg.data.timestamp,
      })),
      retry({
        count: WS_CONFIG.maxRetries,
        delay: (error, retryCount) => {
          this.connectionStatus$.next('reconnecting');
          const delay = Math.min(
            WS_CONFIG.baseRetryDelay * (2 ** (retryCount - 1)),
            WS_CONFIG.maxRetryDelay
          );
          console.log(`WebSocket error, reconnecting in ${delay}ms (${retryCount}/${WS_CONFIG.maxRetries})`);
          return timer(delay);
        }
      }),
      repeat({
        delay: () => {
          this.connectionStatus$.next('reconnecting');
          console.log(`WebSocket closed, reconnecting in ${WS_CONFIG.reconnectDelay}ms...`);
          return timer(WS_CONFIG.reconnectDelay);
        }
      }),
      catchError(error => {
        console.error('WebSocket fatal error:', error);
        this.connectionStatus$.next('error');
        throw error;
      })
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.complete();
      this.socket = undefined;
      this.connectionStatus$.next('disconnected');
    }
  }

  private createSocket(symbol: string): Observable<WebSocketMessage> {
    const wsUrl = apiBaseUrl.replace(/^http/, 'ws');

    this.socket = webSocket<WebSocketMessage>({
      url: `${wsUrl}/ws/quotes`,
      openObserver: {
        next: () => {
          console.log(`WebSocket connected for ${symbol}`);
          this.connectionStatus$.next('connected');
          this.socket?.next({
            type: 'subscribe',
            symbol,
            intervalMs: WS_CONFIG.subscribeInterval
          });
        }
      },
      closeObserver: {
        next: () => console.log(`WebSocket closed for ${symbol}`)
      }
    });

    return this.socket.asObservable();
  }
}
