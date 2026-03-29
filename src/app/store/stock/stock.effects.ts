import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { auditTime, catchError, finalize, map, of, switchMap, takeUntil, withLatestFrom, EMPTY } from 'rxjs';
import { StockDetailService } from '../../services/stock-detail.service';
import { QuoteStreamService } from '../../services/quote-stream.service';
import { StockActions } from './stock.actions';
import { selectDetail } from './stock.reducer';
import { StockDetailUpdate } from '../../models';

@Injectable()
export class StockEffects {
  readonly loadStockDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetail),
      switchMap(({ symbol }) =>
        this.stockDetailService.getStockDetail(symbol).pipe(
          map((detail) => StockActions.loadDetailSuccess({ detail })),
          catchError((error) =>
            of(StockActions.loadDetailFailure({
              error: error?.message ?? 'Unable to load stock details'
            }))
          )
        )
      )
    )
  );

  readonly liveQuoteStream$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetailSuccess, StockActions.startLiveStream),
      withLatestFrom(this.store.select(selectDetail)),
      switchMap(([action, storeDetail]) => {
        const symbol = 'detail' in action ? action.detail.symbol : storeDetail?.symbol;
        if (!symbol) return EMPTY;
        return this.quoteStreamService.stream(symbol).pipe(
          map((quote) => ({ symbol: quote.symbol ?? symbol, price: quote.price, updatedAt: quote.timestamp } as StockDetailUpdate)),
          auditTime(1000),
          map((update) => StockActions.liveQuoteUpdate({ update })),
          takeUntil(this.actions$.pipe(ofType(StockActions.stopLiveStream, StockActions.resetDetail, StockActions.loadDetail))),
          finalize(() => this.quoteStreamService.disconnect()),
          catchError((error) =>
            of(StockActions.loadDetailFailure({
              error: error?.message ?? 'Live quote stream error'
            }))
          )
        );
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly stockDetailService: StockDetailService,
    private readonly quoteStreamService: QuoteStreamService,
  ) {}
}
