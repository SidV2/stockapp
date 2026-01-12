/**
 * Stock-related utility functions
 */

/**
 * Normalizes a stock symbol by trimming whitespace and converting to uppercase
 * @param symbol - The stock symbol to normalize
 * @returns The normalized symbol
 * @throws Error if symbol is empty or invalid
 */
export function normalizeStockSymbol(symbol: string): string {
  const trimmed = symbol.trim().toUpperCase();
  if (!trimmed) {
    throw new Error('Symbol is required');
  }
  return trimmed;
}
