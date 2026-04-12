import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { auditTime, catchError, distinctUntilChanged, filter, finalize, map, of, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { StockDetailService } from '../../services/stock-detail.service';
import { QuoteStreamService } from '../../services/quote-stream.service';
import { StockActions } from './stock.actions';
import { selectDetail } from './stock.reducer';

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
      map(([action, storeDetail]) =>
        'detail' in action ? action.detail.symbol : storeDetail?.symbol
      ),
      filter((symbol): symbol is string => !!symbol),
      distinctUntilChanged(),
      switchMap((symbol) => {
        return this.quoteStreamService.stream(symbol).pipe(
          auditTime(1000),
          distinctUntilChanged((a, b) => a.price === b.price),
          map((quote) => StockActions.liveQuoteUpdate({
            update: { symbol: quote.symbol ?? symbol, price: quote.price, updatedAt: quote.timestamp }
          })),
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
