import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, DestroyRef, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { AboutPanelComponent } from '../../components/about-panel/about-panel.component';
import { LatestHeadlinesComponent } from '../../components/latest-headlines/latest-headlines.component';
import { StockHeroComponent } from '../../components/stock-hero/stock-hero.component';
import { StockSignalAdvisorComponent } from '../../components/stock-signal-advisor/stock-signal-advisor.component';
import { HistoryRange } from '../../models/stock.models';
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
export class StockDetailComponent {
  // Convert observables to signals for better performance and readability
  readonly detail = toSignal(this.store.select(selectLiveStock));
  readonly loading = toSignal(this.store.select(selectIsStockDetailLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectStockDetailError));
  readonly history = toSignal(this.store.select(selectStockHistory));
  readonly connectionStatus = toSignal(this.quoteStreamService.getConnectionStatus(), { initialValue: 'disconnected' as const });

  // Use signals for local state
  readonly timeframes: string[] = ['Live', '1d', '5d', '1m', '6m', '1y', '5y'];
  readonly selectedTimeframe = signal<string>(this.timeframes[0]);
  private readonly currentSymbol = signal<string | null>(null);

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly destroyRef: DestroyRef,
    private readonly quoteStreamService: QuoteStreamService
  ) {
    // Handle route parameter changes
    this.route.paramMap.pipe(
      map(params => params.get('symbol')),
      filter((symbol): symbol is string => !!symbol),
      map(symbol => symbol.toUpperCase()),
      distinctUntilChanged(),
      tap(symbol => {
        this.currentSymbol.set(symbol);
        this.store.dispatch(StockActions.loadDetail({ symbol }));
        this.loadHistoryForCurrentTimeframe();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
      
    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.store.dispatch(StockActions.resetDetail());
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
}
