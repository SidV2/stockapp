import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockDetail } from '../models/stock.models';
import { HttpClient } from '@angular/common/http';
import { stockDetailEndpoint } from '../../constants/api.constants';
/**
 * Minimal scaffold for the stock detail data flow.
 *
 * Drop your own HTTP logic inside `getStockDetail` (or break the method apart)
 * and return an observable that emits the fully-hydrated detail object your
 * components expect. The store/effects layer already calls this method.
 */
@Injectable({ providedIn: 'root' })
export class StockDetailService {

  /**
   * Http client
   */
  private httpClient = inject(HttpClient);

  /**
   * Gets the stock detail
   * @param symbol 
   * @returns 
   */
  getStockDetail(symbol: string): Observable<StockDetail> {
    const normalized = this.normalizeSymbol(symbol);
    return this.httpClient.get<StockDetail>(`${stockDetailEndpoint}/${normalized}/detail`);
  }

  private normalizeSymbol(symbol: string): string {
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) {
      throw new Error('Symbol is required');
    }
    return trimmed;
  }
}
