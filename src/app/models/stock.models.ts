export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number; // absolute change
  changePercent: number; // -1.23 means -1.23%
  marketCap?: number;
  volume?: number;
  history?: number[]; // recent prices for sparkline
}

export interface MarketIndex {
  symbol: string; // e.g., ^GSPC
  name: string;   // e.g., S&P 500
  price: number;
  change: number;
  changePercent: number;
  history?: number[]; // recent prices for sparkline
}

export interface MarketSnapshot {
  indices: MarketIndex[];
  watchlist: StockQuote[];
  asOf: number; // epoch ms
}

export interface StockPick {
  symbol: string;
  company: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  sparkline: number[];
  trend: 'up' | 'down';
}

export interface StockResult {
  symbol: string;
  company: string;
  price: number;
  changePercent: number;
  changeValue: number;
  highlight?: boolean;
}

export interface StockInsight {
  label: string;
  value: string;
  delta?: number;
  deltaDirection?: 'up' | 'down';
}

export interface StockNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  excerpt: string;
}

export interface StockDetail {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayRange: [number, number];
  week52Range: [number, number];
  marketCap: number;
  volume: number;
  avgVolume: number;
  peRatio: number;
  dividendYield?: number;
  beta?: number;
  description: string;
  summary: string;
  insights: StockInsight[];
  news: StockNewsItem[];
  history: number[];
  historyIntervalMinutes?: number;
  updatedAt: number;
}
