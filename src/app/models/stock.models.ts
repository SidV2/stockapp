export interface StockPick {
  symbol: string;
  company: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  sparkline: number[];
  trend: 'up' | 'down';
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

// Live updates may only include a subset of fields; symbol is filled client-side if absent.
export type StockDetailUpdate = Partial<StockDetail> & { symbol?: string; updatedAt?: number };

export type HistoryRange = '1d' | '5d' | '1m' | '6m' | '1y' | '5y';

export interface StockHistory {
  symbol: string;
  range: HistoryRange;
  history: number[];
}
