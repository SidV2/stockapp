import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { StockHistoryService } from '../../services/stock-history.service';
import { StockHistoryActions } from './stock-history.actions';

@Injectable()
export class StockHistoryEffects {
  readonly loadStockHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockHistoryActions.loadHistory),
      switchMap(({ symbol, range }) =>
        this.stockHistoryService.getStockHistory(symbol, range).pipe(
          map((history) => StockHistoryActions.loadHistorySuccess({ history })),
          catchError((error) =>
            of(
              StockHistoryActions.loadHistoryFailure({
                error: error?.message ?? 'Unable to load stock history'
              })
            )
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly stockHistoryService: StockHistoryService
  ) {}
}
