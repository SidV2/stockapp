import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { auditTime, catchError, filter, finalize, map, of, switchMap, takeUntil, withLatestFrom } from 'rxjs';
import { StockDetailService } from '../../services/stock-detail.service';
import { QuoteStreamService } from '../../services/quote-stream.service';
import { StockActions } from './stock.actions';
import { StockDetailUpdate } from '../../models';
import { Store } from '@ngrx/store';
import { selectStockDetail } from './stock.selectors';

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

  readonly liveQuoteStream$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetailSuccess),
      switchMap(({ detail }) =>
        this.quoteStreamService.stream(detail.symbol).pipe(
          map((quote) => ({ symbol: quote.symbol, price: quote.price, updatedAt: quote.timestamp } as StockDetailUpdate)),
          auditTime(1000),
          map((update) =>
            StockActions.liveQuoteUpdate({
              update: { ...update, symbol: update.symbol ?? detail.symbol }
            })
          ),
          takeUntil(this.actions$.pipe(ofType(StockActions.resetDetail, StockActions.loadDetail))),
          finalize(() => this.quoteStreamService.disconnect()),
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

  readonly trackLivePriceHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.liveQuoteUpdate),
      withLatestFrom(this.store.select(selectStockDetail)),
      filter(([_, detail]) => !!detail),
      map(([action, detail]) => {
        const update = action.update;
        if (update.symbol !== detail?.symbol) {
          return null;
        }
        return update.price;
      }),
      filter((price): price is number => price !== null && price !== undefined),
      map((price) => StockActions.appendLivePrice({ price }))
    )
  );

  readonly resetLiveHistoryOnSymbolChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadDetailSuccess),
      withLatestFrom(this.store.select(selectStockDetail)),
      map(([action, previousDetail]) => {
        const newDetail = action.detail;
        const isNewSymbol = newDetail.symbol !== previousDetail?.symbol;
        if (isNewSymbol) {
          return StockActions.resetLiveHistory({ history: newDetail.history ?? [] });
        }
        return null;
      }),
      filter((action): action is ReturnType<typeof StockActions.resetLiveHistory> => action !== null)
    )
  );

    constructor(
    private readonly actions$: Actions,
    private readonly stockDetailService: StockDetailService,
    private readonly quoteStreamService: QuoteStreamService,
    private readonly store: Store
  ) {}
}
