import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, effect, ElementRef, EventEmitter, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, Subject } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { StockDetail } from '../../models/stock.models';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-stock-hero',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  templateUrl: './stock-hero.component.html',
  styleUrl: './stock-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHeroComponent implements OnInit {
  // Modern Angular signals for inputs/outputs
  readonly detail = input.required<StockDetail | undefined>();
  readonly selectedTimeframe = input.required<string>();
  readonly history = input<number[] | null | undefined>(undefined);
  readonly timeframes = input<string[]>([]);
  readonly timeframeChange = output<string>();

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer?: ElementRef<HTMLDivElement>;

  // Local state as signals
  private readonly liveHistory = signal<number[]>([]);
  private readonly MAX_LIVE_HISTORY = 200;
  readonly chartWidth = signal(680);
  private readonly resize$ = new Subject<void>();

  // Computed values using signals - cleaner than getters
  readonly displayPrice = computed(() => {
    const timeframe = this.selectedTimeframe();
    const hist = this.history();
    
    if (timeframe !== 'Live' && hist && hist.length > 0) {
      return hist[hist.length - 1];
    }
    return this.detail()?.price;
  });

  readonly displayChange = computed(() => {
    const timeframe = this.selectedTimeframe();
    const hist = this.history();
    const detail = this.detail();
    
    if (timeframe !== 'Live' && hist && hist.length > 0 && detail?.previousClose) {
      return hist[hist.length - 1] - detail.previousClose;
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

  readonly displayUpdatedAt = computed(() => this.detail()?.updatedAt);

  readonly sparklineHistory = computed(() => {
    const timeframe = this.selectedTimeframe();
    
    if (timeframe === 'Live') {
      const liveHist = this.liveHistory();
      console.log('[StockHero] sparklineHistory for Live:', liveHist.length, 'points');
      return liveHist;
    }
    if (timeframe === '1d') {
      return this.detail()?.history;
    }
    return this.history() ?? undefined;
  });

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private readonly destroyRef: DestroyRef
  ) {
    // Setup resize handler with animation frame scheduling
    this.resize$.pipe(
      observeOn(animationFrameScheduler),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.updateChartWidth());

    // Use effect to handle live history updates
    effect(() => {
      const detail = this.detail();
      
      if (!detail) return;

      // Check if this is a new symbol or first load
      const isNewSymbol = detail.symbol !== this.previousSymbol;

      if (isNewSymbol) {
        // Initialize or reset history for new symbol
        const initialHistory = detail.history ?? [];
        console.log('[StockHero] Initializing live history for', detail.symbol, 'with', initialHistory.length, 'points');
        this.liveHistory.set(initialHistory.slice(-this.MAX_LIVE_HISTORY));
        this.previousSymbol = detail.symbol;
      } else {
        // Add new price point for the same symbol (live update)
        const currentHistory = this.liveHistory();
        
        // Only add if price actually changed to avoid duplicates
        const lastPrice = currentHistory[currentHistory.length - 1];
        if (lastPrice !== detail.price) {
          const updated = [...currentHistory, detail.price];
          this.liveHistory.set(
            updated.length > this.MAX_LIVE_HISTORY
              ? updated.slice(-this.MAX_LIVE_HISTORY)
              : updated
          );
          console.log('[StockHero] Added new price', detail.price, 'total points:', this.liveHistory().length);
        }
      }
    }, { allowSignalWrites: true });
  }

  private previousSymbol?: string;

  ngOnInit(): void {
    const resizeObserver = new ResizeObserver(() => this.resize$.next());
    resizeObserver.observe(this.elementRef.nativeElement);
    
    // Cleanup
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    
    // Initial width calculation
    setTimeout(() => this.updateChartWidth(), 0);
  }

  onTimeframeSelect(range: string): void {
    this.timeframeChange.emit(range);
  }

  private updateChartWidth(): void {
    const container = this.chartContainer?.nativeElement;
    if (!container) return;

    const computedStyle = getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 24;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 24;
    const buffer = 4;
    
    const width = Math.max(
      container.offsetWidth - paddingLeft - paddingRight - buffer,
      300
    );
    
    this.chartWidth.set(width);
    this.cdr.markForCheck();
  }
}
