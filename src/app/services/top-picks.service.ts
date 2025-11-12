import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { topPicksEndpoint } from '../../constants/api.constants';
import { StockPick } from '../models/stock.models';

@Injectable({
  providedIn: 'root'
})
export class TopPicksService {
  private readonly httpClient = inject(HttpClient);

  getTopPicks(): Observable<StockPick[]> {
    return this.httpClient.get<StockPick[]>(topPicksEndpoint);
  }
}
