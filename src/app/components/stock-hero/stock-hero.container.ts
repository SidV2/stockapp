import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { HistoryRange } from '../../models';
import { StockHistoryActions } from '../../store/stock-history/stock-history.actions';
import { selectStockHistory } from '../../store/stock-history/stock-history.selectors';
import { selectLiveStock } from '../../store/stock/stock.selectors';
import { StockHeroComponent } from './stock-hero.component';

@Component({
  selector: 'app-stock-hero-container',
  standalone: true,
  imports: [StockHeroComponent],
  templateUrl: './stock-hero.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHeroContainerComponent {
  private readonly store = inject(Store);

  readonly selectedTimeframe = input.required<string>();
  readonly timeframes = input<string[]>([]);
  readonly timeframeChange = output<string>();

  readonly detail = this.store.selectSignal(selectLiveStock);
  private readonly storeHistory = this.store.selectSignal(selectStockHistory);

  private readonly liveHistory = signal<number[]>([]);
  private readonly MAX_LIVE_HISTORY = 200;
  private previousSymbol?: string;

  // Business logic: accumulate live price history, reset on symbol change
  constructor() {
    effect(() => {
      const detail = this.detail();
      if (!detail) return;

      const isNewSymbol = detail.symbol !== this.previousSymbol;
      if (isNewSymbol) {
        this.liveHistory.set((detail.history ?? []).slice(-this.MAX_LIVE_HISTORY));
        this.previousSymbol = detail.symbol;
      } else {
        const current = this.liveHistory();
        const last = current[current.length - 1];
        if (last !== detail.price) {
          const updated = [...current, detail.price];
          this.liveHistory.set(
            updated.length > this.MAX_LIVE_HISTORY ? updated.slice(-this.MAX_LIVE_HISTORY) : updated
          );
        }
      }
    }, { allowSignalWrites: true });
  }

  // Business logic: which price to display based on selected timeframe
  readonly displayPrice = computed(() => {
    const timeframe = this.selectedTimeframe();
    const history = this.storeHistory()?.history;
    if (timeframe !== 'Live' && timeframe !== '1d' && history?.length) {
      return history[history.length - 1];
    }
    return this.detail()?.price;
  });

  readonly displayChange = computed(() => {
    const timeframe = this.selectedTimeframe();
    const history = this.storeHistory()?.history;
    const detail = this.detail();
    if (timeframe !== 'Live' && timeframe !== '1d' && history?.length && detail?.previousClose) {
      return history[history.length - 1] - detail.previousClose;
    }
    return detail?.change;
  });

  readonly displayChangePercent = computed(() => {
    const change = this.displayChange();
    const detail = this.detail();
    if (change !== undefined && detail?.previousClose) {
      return change / detail.previousClose;
    }
    return detail?.changePercent;
  });

  // Business logic: which history array feeds the sparkline chart
  readonly sparklineValues = computed(() => {
    const timeframe = this.selectedTimeframe();
    if (timeframe === 'Live') return this.liveHistory();
    if (timeframe === '1d') return this.detail()?.history;
    return this.storeHistory()?.history ?? undefined;
  });

  onTimeframeChange(range: string): void {
    this.timeframeChange.emit(range);
    const symbol = this.detail()?.symbol;
    if (symbol && range !== 'Live' && range !== '1d') {
      this.store.dispatch(StockHistoryActions.loadHistory({ symbol, range: range as HistoryRange }));
    }
  }
}
