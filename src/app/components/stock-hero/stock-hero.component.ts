import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, Subject } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { StockDetail } from '../../models';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-stock-hero',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  templateUrl: './stock-hero.component.html',
  styleUrl: './stock-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHeroComponent implements AfterViewInit {
  readonly detail = input.required<StockDetail | undefined>();
  readonly selectedTimeframe = input.required<string>();
  readonly history = input<number[] | null | undefined>(undefined);
  readonly timeframes = input<string[]>([]);
  readonly timeframeChange = output<string>();

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer?: ElementRef<HTMLDivElement>;

  private readonly liveHistory = signal<number[]>([]);
  private readonly MAX_LIVE_HISTORY = 200;
  readonly chartWidth = signal(680);
  private readonly resize$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;

  readonly animatedPrice = signal<number | undefined>(undefined);
  readonly animatedChange = signal<number | undefined>(undefined);
  readonly animatedChangePercent = signal<number | undefined>(undefined);

  private priceAnimationId?: number;
  private changeAnimationId?: number;
  private changePercentAnimationId?: number;

  private targetPrice?: number;
  private targetChange?: number;
  private targetChangePercent?: number;
  private previousSymbol?: string;

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
      return this.liveHistory();
    }
    if (timeframe === '1d') {
      return this.detail()?.history;
    }
    return this.history() ?? undefined;
  });

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef
  ) {
    // Setup resize handler
    this.resize$.pipe(
      observeOn(animationFrameScheduler),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.updateChartWidth());

    // Register all cleanup in constructor
    this.destroyRef.onDestroy(() => {
      this.resize$.complete();
      this.resizeObserver?.disconnect();
      if (this.priceAnimationId) cancelAnimationFrame(this.priceAnimationId);
      if (this.changeAnimationId) cancelAnimationFrame(this.changeAnimationId);
      if (this.changePercentAnimationId) cancelAnimationFrame(this.changePercentAnimationId);
    });

    // Price animation effect
    effect(() => {
      this.handlePriceChange(this.displayPrice());
    }, { allowSignalWrites: true });

    // Change animation effect
    effect(() => {
      this.handleChangeUpdate(this.displayChange());
    }, { allowSignalWrites: true });

    // Change percent animation effect
    effect(() => {
      this.handleChangePercentUpdate(this.displayChangePercent());
    }, { allowSignalWrites: true });

    // Live history updates effect
    effect(() => {
      const detail = this.detail();
      if (!detail) return;

      const isNewSymbol = detail.symbol !== this.previousSymbol;

      if (isNewSymbol) {
        const initialHistory = detail.history ?? [];
        this.liveHistory.set(initialHistory.slice(-this.MAX_LIVE_HISTORY));
        this.previousSymbol = detail.symbol;
      } else {
        const currentHistory = this.liveHistory();
        const lastPrice = currentHistory[currentHistory.length - 1];
        if (lastPrice !== detail.price) {
          const updated = [...currentHistory, detail.price];
          this.liveHistory.set(
            updated.length > this.MAX_LIVE_HISTORY
              ? updated.slice(-this.MAX_LIVE_HISTORY)
              : updated
          );
        }
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit(): void {
    this.updateChartWidth();

    if (this.chartContainer) {
      this.resizeObserver = new ResizeObserver(() => this.resize$.next());
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  onTimeframeSelect(range: string): void {
    this.timeframeChange.emit(range);
  }

  private handlePriceChange(newPrice: number | undefined): void {
    if (newPrice !== undefined && newPrice !== this.targetPrice) {
      const currentPrice = this.animatedPrice();
      
      if (currentPrice === undefined) {
        // First time - set immediately without animation
        this.animatedPrice.set(newPrice);
        this.targetPrice = newPrice;
      } else {
        // Use the previous target as starting point if we had one (smooth transition)
        const startValue = this.targetPrice ?? currentPrice;
        this.targetPrice = newPrice;
        this.animateValue(
          startValue, 
          newPrice, 
          (val: number) => this.animatedPrice.set(val),
          this.priceAnimationId,
          (id) => this.priceAnimationId = id
        );
      }
    }
  }

  private handleChangeUpdate(newChange: number | undefined): void {
    if (newChange !== undefined && newChange !== this.targetChange) {
      const currentChange = this.animatedChange();
      
      if (currentChange === undefined) {
        this.animatedChange.set(newChange);
        this.targetChange = newChange;
      } else {
        const startValue = this.targetChange ?? currentChange;
        this.targetChange = newChange;
        this.animateValue(
          startValue, 
          newChange, 
          (val: number) => this.animatedChange.set(val),
          this.changeAnimationId,
          (id) => this.changeAnimationId = id
        );
      }
    }
  }

  private handleChangePercentUpdate(newPercent: number | undefined): void {
    if (newPercent !== undefined && newPercent !== this.targetChangePercent) {
      const currentPercent = this.animatedChangePercent();
      
      if (currentPercent === undefined) {
        this.animatedChangePercent.set(newPercent);
        this.targetChangePercent = newPercent;
      } else {
        const startValue = this.targetChangePercent ?? currentPercent;
        this.targetChangePercent = newPercent;
        this.animateValue(
          startValue, 
          newPercent, 
          (val: number) => this.animatedChangePercent.set(val),
          this.changePercentAnimationId,
          (id) => this.changePercentAnimationId = id
        );
      }
    }
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
  
  private animateValue(
    from: number, 
    to: number, 
    setter: (val: number) => void,
    currentId: number | undefined,
    setId: (id: number | undefined) => void,
    duration: number = 350
  ): void {
    // Cancel any existing animation for this specific property
    if (currentId) {
      cancelAnimationFrame(currentId);
    }
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * easeProgress;
      
      setter(current);
      
      // Trigger change detection for OnPush strategy
      this.cdr.markForCheck();
      
      if (progress < 1) {
        setId(requestAnimationFrame(animate));
      } else {
        setId(undefined);
      }
    };
    
    setId(requestAnimationFrame(animate));
  }
}
