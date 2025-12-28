import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
export class StockHeroComponent {
  @Input({ required: true }) detail: StockDetail | undefined;
  @Input({ required: true }) selectedTimeframe: string | undefined;
  @Input() history: number[] | null | undefined;
  @Input() timeframes: string[] = [];

  @Output() timeframeChange = new EventEmitter<string>();

  onTimeframeSelect(range: string): void {
    this.timeframeChange.emit(range);
  }
}
