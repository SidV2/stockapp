import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AboutPanelComponent } from '../../components/about-panel/about-panel.component';
import { LatestHeadlinesComponent } from '../../components/latest-headlines/latest-headlines.component';
import { StockHeroComponent } from '../../components/stock-hero/stock-hero.component';
import { StockSignalAdvisorComponent } from '../../components/stock-signal-advisor/stock-signal-advisor.component';
import { HistoryRange } from '../../models';
import { StockActions } from '../../store/stock/stock.actions';
import { selectIsStockDetailLoading, selectLiveStock, selectStockDetailError } from '../../store/stock/stock.selectors';
import { StockHistoryActions } from '../../store/stock-history/stock-history.actions';
import { selectStockHistory } from '../../store/stock-history/stock-history.selectors';
import { QuoteStreamService } from '../../services/quote-stream.service';
@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StockHeroComponent, AboutPanelComponent, LatestHeadlinesComponent, StockSignalAdvisorComponent],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly quoteStreamService = inject(QuoteStreamService);
  private readonly destroyRef = inject(DestroyRef);

  // Convert observables to signals for better performance and readability
  readonly detail = this.store.selectSignal(selectLiveStock);
  readonly loading = this.store.selectSignal(selectIsStockDetailLoading);
  readonly error = this.store.selectSignal(selectStockDetailError);
  readonly history = this.store.selectSignal(selectStockHistory);
  readonly connectionStatus = toSignal(this.quoteStreamService.getConnectionStatus(), { requireSync: true });

  // Use signals for local state
  readonly timeframes: string[] = ['Live', '1d', '5d', '1m', '6m', '1y', '5y'];
  readonly selectedTimeframe = signal<string>(this.timeframes[0]);
  private readonly currentSymbol = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('symbol')),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(symbol => {
      if (symbol) {
        const upperSymbol = symbol.toUpperCase();
        this.currentSymbol.set(upperSymbol);
        this.store.dispatch(StockActions.loadDetail({ symbol: upperSymbol }));
        this.loadHistoryForCurrentTimeframe();
      }
    });
  }

  reload(): void {
    const symbol = this.currentSymbol();
    if (symbol) {
      this.store.dispatch(StockActions.loadDetail({ symbol }));
    }
  }

  setTimeframe(range: string): void {
    this.selectedTimeframe.set(range);
    this.loadHistoryForCurrentTimeframe();
  }

  private loadHistoryForCurrentTimeframe(): void {
    const symbol = this.currentSymbol();
    const timeframe = this.selectedTimeframe();
    
    if (symbol && timeframe !== 'Live' && timeframe !== '1d') {
      this.store.dispatch(
        StockHistoryActions.loadHistory({ 
          symbol, 
          range: timeframe as HistoryRange 
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(StockActions.resetDetail());
  }
}
