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

export type WebSocketMessage = StockQuoteMessage | SubscribeMessage;

export interface QuoteUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';
