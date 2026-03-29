import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { SparklineContainerComponent } from '../sparkline/sparkline.container';

@Component({
  selector: 'app-stock-hero',
  standalone: true,
  imports: [CommonModule, SparklineContainerComponent],
  templateUrl: './stock-hero.component.html',
  styleUrl: './stock-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHeroComponent {
  // All data pre-computed by the container — presenter only handles display
  readonly symbol = input<string | undefined>();
  readonly company = input<string | undefined>();
  readonly summary = input<string | undefined>();
  readonly updatedAt = input<number | undefined>();
  readonly price = input<number | undefined>();
  readonly change = input<number | undefined>();
  readonly changePercent = input<number | undefined>();
  readonly sparklineValues = input<number[] | undefined>(undefined);
  readonly timeframes = input<string[]>([]);
  readonly selectedTimeframe = input.required<string>();
  readonly timeframeChange = output<string>();

  // Presentation state: animated display values
  readonly animatedPrice = signal<number | undefined>(undefined);
  readonly animatedChange = signal<number | undefined>(undefined);
  readonly animatedChangePercent = signal<number | undefined>(undefined);

  private readonly destroyRef = inject(DestroyRef);

  private priceAnimationId?: number;
  private changeAnimationId?: number;
  private changePercentAnimationId?: number;
  private targetPrice?: number;
  private targetChange?: number;
  private targetChangePercent?: number;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.priceAnimationId) cancelAnimationFrame(this.priceAnimationId);
      if (this.changeAnimationId) cancelAnimationFrame(this.changeAnimationId);
      if (this.changePercentAnimationId) cancelAnimationFrame(this.changePercentAnimationId);
    });

    effect(() => { this.handlePriceChange(this.price()); }, { allowSignalWrites: true });
    effect(() => { this.handleChangeUpdate(this.change()); }, { allowSignalWrites: true });
    effect(() => { this.handleChangePercentUpdate(this.changePercent()); }, { allowSignalWrites: true });
  }

  onTimeframeSelect(range: string): void {
    this.timeframeChange.emit(range);
  }

  private handlePriceChange(newPrice: number | undefined): void {
    if (newPrice === undefined || newPrice === this.targetPrice) return;
    const current = this.animatedPrice();
    if (current === undefined) {
      this.animatedPrice.set(newPrice);
      this.targetPrice = newPrice;
    } else {
      const start = this.targetPrice ?? current;
      this.targetPrice = newPrice;
      this.animateValue(start, newPrice, (v) => this.animatedPrice.set(v),
        this.priceAnimationId, (id) => this.priceAnimationId = id);
    }
  }

  private handleChangeUpdate(newChange: number | undefined): void {
    if (newChange === undefined || newChange === this.targetChange) return;
    const current = this.animatedChange();
    if (current === undefined) {
      this.animatedChange.set(newChange);
      this.targetChange = newChange;
    } else {
      const start = this.targetChange ?? current;
      this.targetChange = newChange;
      this.animateValue(start, newChange, (v) => this.animatedChange.set(v),
        this.changeAnimationId, (id) => this.changeAnimationId = id);
    }
  }

  private handleChangePercentUpdate(newPercent: number | undefined): void {
    if (newPercent === undefined || newPercent === this.targetChangePercent) return;
    const current = this.animatedChangePercent();
    if (current === undefined) {
      this.animatedChangePercent.set(newPercent);
      this.targetChangePercent = newPercent;
    } else {
      const start = this.targetChangePercent ?? current;
      this.targetChangePercent = newPercent;
      this.animateValue(start, newPercent, (v) => this.animatedChangePercent.set(v),
        this.changePercentAnimationId, (id) => this.changePercentAnimationId = id);
    }
  }

  private animateValue(
    from: number,
    to: number,
    setter: (val: number) => void,
    currentId: number | undefined,
    setId: (id: number | undefined) => void,
    duration = 350
  ): void {
    if (currentId) cancelAnimationFrame(currentId);
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setter(from + (to - from) * ease);
      if (progress < 1) setId(requestAnimationFrame(animate));
      else setId(undefined);
    };
    setId(requestAnimationFrame(animate));
  }
}
