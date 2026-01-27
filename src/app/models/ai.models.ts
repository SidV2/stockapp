export interface StockAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  targetPrice?: number;
  timeHorizon: 'short-term' | 'medium-term' | 'long-term';
  riskLevel: 'Low' | 'Medium' | 'High';
}
