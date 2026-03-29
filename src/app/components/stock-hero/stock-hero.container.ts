import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Store } from '@ngrx/store';
import { HistoryRange } from '../../models';
import { StockHistoryActions } from '../../store/stock-history/stock-history.actions';
import { selectStockHistory } from '../../store/stock-history/stock-history.selectors';
import { StockActions } from '../../store/stock/stock.actions';
import { selectStockDetail } from '../../store/stock/stock.selectors';
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

  readonly detail = this.store.selectSignal(selectStockDetail);
  private readonly storeHistory = this.store.selectSignal(selectStockHistory);

  // Live: real-time ticking price from reducer
  // 5d+: last value of loaded history range
  readonly displayPrice = computed(() => {
    const timeframe = this.selectedTimeframe();
    if (timeframe === 'Live') return this.detail()?.price;
    return this.storeHistory()?.history?.at(-1) ?? this.detail()?.price;
  });

  readonly displayChange = computed(() => {
    const timeframe = this.selectedTimeframe();
    if (timeframe === 'Live') return this.detail()?.change;
    const price = this.storeHistory()?.history?.at(-1);
    const previousClose = this.detail()?.previousClose;
    if (price !== undefined && previousClose) return price - previousClose;
    return this.detail()?.change;
  });

  readonly displayChangePercent = computed(() => {
    const change = this.displayChange();
    const detail = this.detail();
    if (change !== undefined && detail?.previousClose) {
      return change / detail.previousClose;
    }
    return detail?.changePercent;
  });

  // Live: detail.history grows with WebSocket ticks
  // 5d+: loaded from history store on demand
  readonly sparklineValues = computed(() => {
    const timeframe = this.selectedTimeframe();
    if (timeframe === 'Live') return this.detail()?.history ?? undefined;
    return this.storeHistory()?.history ?? undefined;
  });

  onTimeframeChange(range: string): void {
    this.timeframeChange.emit(range);
    const symbol = this.detail()?.symbol;
    if (range === 'Live') {
      this.store.dispatch(StockActions.startLiveStream());
    } else {
      this.store.dispatch(StockActions.stopLiveStream());
      if (symbol) {
        this.store.dispatch(StockHistoryActions.loadHistory({ symbol, range: range as HistoryRange }));
      }
    }
  }
}
