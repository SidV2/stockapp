import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
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

  readonly chartHistory = computed(() => {
    const timeframe = this.selectedTimeframe();
    const detail = this.detail();
    if (timeframe === 'Live' || timeframe === '1d') {
      return detail?.history ?? null;
    }
    return this.storeHistory()?.history ?? null;
  });

  onTimeframeChange(range: string): void {
    this.timeframeChange.emit(range);
    const symbol = this.detail()?.symbol;
    if (symbol && range !== 'Live' && range !== '1d') {
      this.store.dispatch(StockHistoryActions.loadHistory({ symbol, range: range as HistoryRange }));
    }
  }
}
