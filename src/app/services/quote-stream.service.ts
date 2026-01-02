import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { catchError, delayWhen, filter, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
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

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

@Injectable({ providedIn: 'root' })
export class QuoteStreamService {
  private socket?: WebSocketSubject<StockQuoteMessage>;
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
      filter(message => message.type === 'stockQuote'),
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
      retryWhen(errors => 
        errors.pipe(
          tap(error => {
            console.warn('WebSocket error, attempting reconnect:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              this.connectionStatus$.next('error');
              throw new Error('Max reconnection attempts reached');
            }
            
            this.connectionStatus$.next('reconnecting');
          }),
          delayWhen(() => {
            const delay = Math.min(
              this.baseReconnectDelay * (2 ** (this.reconnectAttempts - 1)),
              this.maxReconnectDelay
            );
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            return timer(delay);
          })
        )
      ),
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
    
    this.socket = webSocket<StockQuoteMessage>({
      url: `${wsUrl}/ws/quotes?symbol=${encodeURIComponent(symbol)}`,
      openObserver: {
        next: () => {
          console.log(`WebSocket connected for ${symbol}`);
          this.connectionStatus$.next('connected');
          this.reconnectAttempts = 0;
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

    return this.socket.asObservable();
  }
}
