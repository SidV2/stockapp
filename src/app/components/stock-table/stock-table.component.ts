import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StockQuote } from '../../models/stock.models';
import { SparklineComponent } from '../sparkline/sparkline.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  templateUrl: './stock-table.component.html',
  styleUrl: './stock-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockTableComponent {
  readonly watchlist$: Observable<StockQuote[]> = of([]);

  constructor(private readonly router: Router) {}

  viewDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
