import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AboutPanelComponent } from '../../components/about-panel/about-panel.component';
import { LatestHeadlinesComponent } from '../../components/latest-headlines/latest-headlines.component';
import { StockHeroComponent } from '../../components/stock-hero/stock-hero.component';
import { StockDetail } from '../../models/stock.models';
import { StockActions } from '../../store/stock/stock.actions';
import {
  selectIsStockDetailLoading,
  selectStockDetail,
  selectStockDetailError
} from '../../store/stock/stock.selectors';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StockHeroComponent, AboutPanelComponent, LatestHeadlinesComponent],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDetailComponent {
  readonly detail$: Observable<StockDetail | null> = this.store.select(selectStockDetail);
  readonly loading$: Observable<boolean> = this.store.select(selectIsStockDetailLoading);
  readonly error$: Observable<string | null | undefined> = this.store.select(selectStockDetailError);

  readonly timeframes = ['1D', '5D', '1M', '6M', '1Y', '5Y'];
  selectedTimeframe = this.timeframes[0];

  private currentSymbol: string | null = null;

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly destroyRef: DestroyRef
  ) {
    this.route.paramMap
      .pipe(
        map((params) => params.get('symbol')),
        filter((symbol): symbol is string => !!symbol),
        map((symbol) => symbol.toUpperCase()),
        distinctUntilChanged(),
        shareReplay(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((symbol) => {
        this.currentSymbol = symbol;
        this.store.dispatch(StockActions.loadDetail({ symbol }));
      });

    this.destroyRef.onDestroy(() => {
      this.store.dispatch(StockActions.resetDetail());
    });
  }

  reload(): void {
    if (this.currentSymbol) {
      this.store.dispatch(StockActions.loadDetail({ symbol: this.currentSymbol }));
    }
  }

  setTimeframe(range: string): void {
    this.selectedTimeframe = range;
  }
}
