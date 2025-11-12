import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MarketIndex } from '../../models/stock.models';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  templateUrl: './market-overview.component.html',
  styleUrl: './market-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketOverviewComponent {
  readonly indices$: Observable<MarketIndex[]> = of([]);
}

