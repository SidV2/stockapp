import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAnalysis } from '../../models';

@Component({
  selector: 'app-stock-signal-advisor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-signal-advisor.component.html',
  styleUrl: './stock-signal-advisor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockSignalAdvisorComponent {
  readonly symbol = input.required<string>();
  readonly analysis = input<StockAnalysis | null>(null);
  readonly isAnalyzing = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly analyzeRequested = output<void>();

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

  analyzeStock(): void {
    this.analyzeRequested.emit();
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
