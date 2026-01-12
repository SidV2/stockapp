import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockDetail } from '../../models/stock.models';
import { StockAnalysis } from '../../services/ai-stock-analyzer.service';
import { AiAdvisorActions } from '../../store/ai-advisor/ai-advisor.actions';
import { selectAiAdvisorViewModel } from '../../store/ai-advisor/ai-advisor.selectors';

@Component({
  selector: 'app-stock-signal-advisor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-signal-advisor.component.html',
  styleUrl: './stock-signal-advisor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockSignalAdvisorComponent implements OnInit, OnDestroy {
  @Input({ required: true }) stockDetail!: StockDetail;

  // Convert store observables to signals
  private readonly viewModel = toSignal(this.store.select(selectAiAdvisorViewModel), {
    initialValue: {
      analysis: null,
      symbol: null,
      isAnalyzing: false,
      error: null,
      lastAnalyzedAt: null
    }
  });

  // Expose individual signals for template
  readonly analysis = computed(() => this.viewModel().analysis);
  readonly isAnalyzing = computed(() => this.viewModel().isAnalyzing);
  readonly error = computed(() => this.viewModel().error);

  readonly signalClass = computed(() => {
    const signal = this.analysis()?.signal;
    return signal ? `signal--${signal.toLowerCase()}` : '';
  });

  readonly confidenceColor = computed(() => {
    const confidence = this.analysis()?.confidence ?? 0;
    if (confidence >= 75) return 'confidence--high';
    if (confidence >= 50) return 'confidence--medium';
    return 'confidence--low';
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.analyzeStock();
  }

  ngOnDestroy(): void {
    // Clean up on component destroy
    this.store.dispatch(AiAdvisorActions.resetAnalysis());
  }

  analyzeStock(): void {
    if (!this.stockDetail) return;

    // Dispatch action to trigger the effect
    this.store.dispatch(AiAdvisorActions.analyzeStock({ 
      stockDetail: this.stockDetail 
    }));
  }

  getSignalIcon(signal: 'BUY' | 'SELL' | 'HOLD'): string {
    switch (signal) {
      case 'BUY': return '↗';
      case 'SELL': return '↘';
      case 'HOLD': return '→';
    }
  }

  getSignalLabel(signal: 'BUY' | 'SELL' | 'HOLD'): string {
    switch (signal) {
      case 'BUY': return 'Buy Signal';
      case 'SELL': return 'Sell Signal';
      case 'HOLD': return 'Hold';
    }
  }

  getRiskIcon(risk: 'Low' | 'Medium' | 'High'): string {
    switch (risk) {
      case 'Low': return '●';
      case 'Medium': return '●';
      case 'High': return '●';
    }
  }
}
