import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { bufferTime, catchError, filter, map, mergeMap, of, switchMap, takeUntil } from 'rxjs';
import { StockDetailService } from '../../services/stock-detail.service';
import { QuoteStreamService } from '../../services/quote-stream.service';
import { StockActions } from './stock.actions';
import { StockDetailUpdate } from '../../models/stock.models';

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
          map((quote) => ({ symbol: quote.symbol, price: quote.price, updatedAt: quote.timestamp } as StockDetailUpdate)),
          bufferTime(200),
          filter((batch) => batch.length > 0),
          map((batch) =>
            batch
              .filter((u) => u && (u.symbol ?? detail.symbol) && (u.updatedAt ?? 0) > 0)
              .sort((a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0))
          ),
          mergeMap((sorted) => sorted),
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
