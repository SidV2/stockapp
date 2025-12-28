import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { stockHistoryEndpoint } from '../../constants/api.constants';
import { StockHistory, HistoryRange } from '../models/stock.models';

@Injectable({ providedIn: 'root' })
export class StockHistoryService {
  private httpClient = inject(HttpClient);

  getStockHistory(symbol: string, range: HistoryRange): Observable<StockHistory> {
    const normalized = this.normalizeSymbol(symbol);
    return this.httpClient.get<StockHistory>(`${stockHistoryEndpoint}/${normalized}/${range}`);
  }

  private normalizeSymbol(symbol: string): string {
    const trimmed = symbol.trim().toUpperCase();
    if (!trimmed) {
      throw new Error('Symbol is required');
    }
    return trimmed;
  }
}
