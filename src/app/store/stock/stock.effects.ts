import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, takeUntil } from 'rxjs';
import { StockDetailService } from '../../services/stock-detail.service';
import { QuoteStreamService } from '../../services/quote-stream.service';
import { StockActions } from './stock.actions';

@Injectable()
export class StockEffects {
  readonly loadStockDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetail),
      switchMap(({ symbol }) =>
        this.stockDetailService.getStockDetail(symbol).pipe(
          map((detail) => StockActions.loadDetailSuccess({ detail })),
          catchError((error) =>
            of(
              StockActions.loadDetailFailure({
                error: error?.message ?? 'Unable to load stock details'
              })
            )
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly stockDetailService: StockDetailService,
    private readonly quoteStreamService: QuoteStreamService
  ) {}

  readonly liveQuoteStream$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetailSuccess),
      switchMap(({ detail }) =>
        this.quoteStreamService.stream(detail.symbol).pipe(
          map((update) =>
            StockActions.liveQuoteUpdate({
              update: { ...update, symbol: update.symbol ?? detail.symbol }
            })
          ),
          takeUntil(this.actions$.pipe(ofType(StockActions.resetDetail, StockActions.loadDetail))),
          catchError((error) =>
            of(
              StockActions.loadDetailFailure({
                error: error?.message ?? 'Live quote stream error'
              })
            )
          )
        )
      )
    )
  );
}
