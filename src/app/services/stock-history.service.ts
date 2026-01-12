import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { stockHistoryEndpoint } from '../../constants/api.constants';
import { StockHistory, HistoryRange } from '../models/stock.models';
import { normalizeStockSymbol } from '../utils/stock.utils';

@Injectable({ providedIn: 'root' })
export class StockHistoryService {
  private httpClient = inject(HttpClient);

  getStockHistory(symbol: string, range: HistoryRange): Observable<StockHistory> {
    const normalized = normalizeStockSymbol(symbol);
    return this.httpClient.get<StockHistory>(`${stockHistoryEndpoint}/${normalized}/${range}`);
  }
}
