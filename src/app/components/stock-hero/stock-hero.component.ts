import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
export class StockHeroComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) detail: StockDetail | undefined;
  @Input({ required: true }) selectedTimeframe: string | undefined;
  @Input() history: number[] | null | undefined;
  @Input() timeframes: string[] = [];

  @Output() timeframeChange = new EventEmitter<string>();

  @ViewChild('chartContainer', { read: ElementRef }) chartContainer?: ElementRef<HTMLDivElement>;

  private liveHistory: number[] = [];
  chartWidth = 680; // Default fallback width
  private resizeObserver?: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Use ResizeObserver to track container size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.updateChartWidth();
    });

    // Observe the host element
    this.resizeObserver.observe(this.elementRef.nativeElement);
    
    // Initial width calculation
    setTimeout(() => this.updateChartWidth(), 0);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detail'] && changes['detail'].currentValue?.symbol !== changes['detail'].previousValue?.symbol) {
      this.liveHistory = [...(this.detail?.history ?? [])];
    }
    if (changes['detail'] && this.detail) {
      this.liveHistory = [...this.liveHistory, this.detail.price];
    }
  }

  get displayPrice(): number | undefined {
    if (this.selectedTimeframe !== 'Live' && this.history && this.history.length > 0) {
      return this.history[this.history.length - 1];
    }
    return this.detail?.price;
  }

  get displayChange(): number | undefined {
    if (this.selectedTimeframe !== 'Live' && this.history && this.history.length > 0 && this.detail?.previousClose) {
      const lastPrice = this.history[this.history.length - 1];
      return lastPrice - this.detail.previousClose;
    }
    return this.detail?.change;
  }

  get displayChangePercent(): number | undefined {
    const change = this.displayChange;
    if (change !== undefined && this.detail?.previousClose) {
      return change / this.detail.previousClose;
    }
    return this.detail?.changePercent;
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
