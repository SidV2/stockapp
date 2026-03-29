import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AiAdvisorActions } from '../../store/ai-advisor/ai-advisor.actions';
import { selectAiAdvisorViewModel } from '../../store/ai-advisor/ai-advisor.selectors';
import { selectStockDetail } from '../../store/stock/stock.selectors';
import { StockSignalAdvisorComponent } from './stock-signal-advisor.component';

@Component({
  selector: 'app-stock-signal-advisor-container',
  standalone: true,
  imports: [StockSignalAdvisorComponent],
  templateUrl: './stock-signal-advisor.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockSignalAdvisorContainerComponent implements OnDestroy {
  private readonly store = inject(Store);

  // Use static detail (not live-merged) so price ticks don't re-trigger AI analysis
  readonly detail = this.store.selectSignal(selectStockDetail);

  private readonly aiViewModel = this.store.selectSignal(selectAiAdvisorViewModel);
  readonly aiAnalysis = computed(() => this.aiViewModel().analysis);
  readonly isAiAnalyzing = computed(() => this.aiViewModel().isAnalyzing);
  readonly aiError = computed(() => this.aiViewModel().error);

  constructor() {
    
  }

  onAnalyzeRequested(): void {
    const detail = this.detail();
    if (detail) {
      this.store.dispatch(AiAdvisorActions.analyzeStock({ stockDetail: detail }));
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(AiAdvisorActions.resetAnalysis());
  }
}
