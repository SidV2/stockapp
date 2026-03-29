import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AboutPanelComponent } from '../../components/about-panel/about-panel.component';
import { LatestHeadlinesComponent } from '../../components/latest-headlines/latest-headlines.component';
import { StockHeroContainerComponent } from '../../components/stock-hero/stock-hero.container';
import { StockSignalAdvisorContainerComponent } from '../../components/stock-signal-advisor/stock-signal-advisor.container';
import { StockActions } from '../../store/stock/stock.actions';
import { selectIsStockDetailLoading, selectLiveStock, selectStockDetailError } from '../../store/stock/stock.selectors';
import { QuoteStreamService } from '../../services/quote-stream.service';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StockHeroContainerComponent, StockSignalAdvisorContainerComponent, AboutPanelComponent, LatestHeadlinesComponent],
  templateUrl: './stock-detail.component.html',
  styleUrl: './stock-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly quoteStreamService = inject(QuoteStreamService);
  private readonly destroyRef = inject(DestroyRef);

  readonly detail = this.store.selectSignal(selectLiveStock);
  readonly loading = this.store.selectSignal(selectIsStockDetailLoading);
  readonly error = this.store.selectSignal(selectStockDetailError);
  readonly connectionStatus = toSignal(this.quoteStreamService.getConnectionStatus(), { requireSync: true });

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
  }

  ngOnDestroy(): void {
    this.store.dispatch(StockActions.resetDetail());
  }
}
