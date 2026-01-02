import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
export class StockHeroComponent implements OnChanges, OnInit {
  @Input({ required: true }) detail: StockDetail | undefined;
  @Input({ required: true }) selectedTimeframe: string | undefined;
  @Input() history: number[] | null | undefined;
  @Input() timeframes: string[] = [];

  @Output() timeframeChange = new EventEmitter<string>();

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer?: ElementRef<HTMLDivElement>;

  private liveHistory: number[] = [];
  private readonly MAX_LIVE_HISTORY = 200; // Keep only last 200 points for performance
  chartWidth = 680; // Default fallback width
  private resizeObserver?: ResizeObserver;
  private resize$ = new Subject<void>();
  
  // Cached computed values
  private _displayPrice?: number;
  private _displayChange?: number;
  private _displayChangePercent?: number;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private destroyRef: DestroyRef
  ) {
    // Sync resize updates with browser's animation frames for optimal performance
    this.resize$
      .pipe(
        observeOn(animationFrameScheduler),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.updateChartWidth();
      });
  }

  ngOnInit(): void {
    // Use ResizeObserver to track container size changes
    this.resizeObserver = new ResizeObserver(() => {
      // Emit resize event to RxJS subject for debouncing
      this.resize$.next();
    });

    // Observe the host element
    this.resizeObserver.observe(this.elementRef.nativeElement);
    
    // Initial width calculation
    setTimeout(() => this.updateChartWidth(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detail'] && changes['detail'].currentValue?.symbol !== changes['detail'].previousValue?.symbol) {
      // Limit initial history to MAX_LIVE_HISTORY for performance
      const history = this.detail?.history ?? [];
      this.liveHistory = history.slice(-this.MAX_LIVE_HISTORY);
    }
    if (changes['detail'] && this.detail) {
      // More efficient: push and slice instead of spread operator
      this.liveHistory.push(this.detail.price);
      
      // Keep only the last MAX_LIVE_HISTORY points
      if (this.liveHistory.length > this.MAX_LIVE_HISTORY) {
        this.liveHistory = this.liveHistory.slice(-this.MAX_LIVE_HISTORY);
      }
    }
    
    // Recalculate cached values only when inputs change
    if (changes['detail'] || changes['history'] || changes['selectedTimeframe']) {
      this.recalculateDisplayValues();
    }
  }

  get displayPrice(): number | undefined {
    return this._displayPrice;
  }

  get displayChange(): number | undefined {
    return this._displayChange;
  }

  get displayChangePercent(): number | undefined {
    return this._displayChangePercent;
  }
  
  private recalculateDisplayValues(): void {
    const oldPrice = this._displayPrice;
    
    // Display Price
    if (this.selectedTimeframe !== 'Live' && this.history && this.history.length > 0) {
      this._displayPrice = this.history[this.history.length - 1];
    } else {
      this._displayPrice = this.detail?.price;
    }
    
    // Display Change
    if (this.selectedTimeframe !== 'Live' && this.history && this.history.length > 0 && this.detail?.previousClose) {
      const lastPrice = this.history[this.history.length - 1];
      this._displayChange = lastPrice - this.detail.previousClose;
    } else {
      this._displayChange = this.detail?.change;
    }
    
    // Display Change Percent
    if (this._displayChange !== undefined && this.detail?.previousClose) {
      this._displayChangePercent = this._displayChange / this.detail.previousClose;
    } else {
      this._displayChangePercent = this.detail?.changePercent;
    }
    
  }

  get displayUpdatedAt(): number | undefined {
    return this.detail?.updatedAt;
  }
  
  get sparklineHistory(): number[] | undefined {
    if (this.selectedTimeframe === 'Live') {
      return this.liveHistory;
    }
    if (this.selectedTimeframe === '1d') {
      return this.detail?.history;
    }
    return this.history ?? undefined;
  }

  onTimeframeSelect(range: string): void {
    this.timeframeChange.emit(range);
  }

  private updateChartWidth(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      // Account for padding and stroke width
      // 1.5rem padding on each side (3rem total) + extra buffer for stroke
      const computedStyle = getComputedStyle(this.chartContainer.nativeElement);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 24;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 24;
      const buffer = 4; // Extra buffer for stroke width
      
      this.chartWidth = Math.max(containerWidth - paddingLeft - paddingRight - buffer, 300);
      this.cdr.markForCheck();
    }
  }
}
