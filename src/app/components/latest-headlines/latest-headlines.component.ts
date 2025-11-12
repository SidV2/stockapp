import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StockNewsItem } from '../../models/stock.models';

@Component({
  selector: 'app-latest-headlines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest-headlines.component.html',
  styleUrl: './latest-headlines.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestHeadlinesComponent {
  @Input({ required: true }) news: StockNewsItem[] = [];
}
