import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, filter, map, repeat, retry, shareReplay, tap } from 'rxjs/operators';
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

export interface SubscribeMessage {
  type: 'subscribe';
  symbol: string;
  intervalMs: number;
}

type WebSocketMessage = StockQuoteMessage | SubscribeMessage;

export interface QuoteUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

@Injectable({ providedIn: 'root' })
export class QuoteStreamService {
  private socket?: WebSocketSubject<WebSocketMessage>;
  private connectionStatus$ = new BehaviorSubject<ConnectionStatus>('disconnected');
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000; // Start with 1 second
  private readonly maxReconnectDelay = 30000; // Max 30 seconds

  /**
   * Get current connection status
   */
  public getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Connect to the quote stream for a symbol with automatic reconnection.
   */
  public stream(symbol: string): Observable<QuoteUpdate> {
    // Close existing connection and reset state
    this.disconnect();
    
    return this.createWebSocketConnection(symbol).pipe(
      map(message => ({
        symbol: message.symbol,
        price: message.data.price,
        timestamp: message.data.timestamp,
      })),
      tap(() => {
        if (this.connectionStatus$.value !== 'connected') {
          this.connectionStatus$.next('connected');
          this.reconnectAttempts = 0;
        }
      }),
      // Retry on errors with exponential backoff
      retry({
        count: this.maxReconnectAttempts,
        delay: (error, retryCount) => {
          console.warn('WebSocket error, attempting reconnect:', error);
          this.reconnectAttempts = retryCount;
          this.connectionStatus$.next('reconnecting');

          const delay = Math.min(
            this.baseReconnectDelay * (2 ** (retryCount - 1)),
            this.maxReconnectDelay
          );
          console.log(`Reconnecting in ${delay}ms (attempt ${retryCount}/${this.maxReconnectAttempts})`);
          return timer(delay);
        }
      }),
      // Repeat on normal close (server closed connection)
      repeat({
        delay: () => {
          console.log('WebSocket closed, reconnecting in 2s...');
          this.connectionStatus$.next('reconnecting');
          return timer(2000);
        }
      }),
      catchError(error => {
        console.error('Fatal WebSocket error:', error);
        this.connectionStatus$.next('error');
        throw error;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  /**
   * Manually disconnect the WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.complete();
      this.socket = undefined;
      this.connectionStatus$.next('disconnected');
      this.reconnectAttempts = 0;
    }
  }

  private createWebSocketConnection(symbol: string): Observable<StockQuoteMessage> {
    const wsUrl = apiBaseUrl.replace(/^http/, 'ws');

    this.socket = webSocket<WebSocketMessage>({
      url: `${wsUrl}/ws/quotes`,
      openObserver: {
        next: () => {
          console.log(`WebSocket connected for ${symbol}`);
          this.connectionStatus$.next('connected');
          this.reconnectAttempts = 0;

          // Send subscribe message after connection opens
          this.socket?.next({
            type: 'subscribe',
            symbol: symbol,
            intervalMs: 1000
          });
        }
      },
      closeObserver: {
        next: () => {
          console.log(`WebSocket closed for ${symbol}`);
          if (this.connectionStatus$.value === 'connected') {
            this.connectionStatus$.next('reconnecting');
          }
        }
      }
    });

    return this.socket.asObservable().pipe(
      filter((msg): msg is StockQuoteMessage => msg.type === 'stockQuote')
    );
  }
}
