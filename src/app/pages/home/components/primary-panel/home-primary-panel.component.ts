import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { StockPick } from '../../../../models/stock.models';
import { SparklineComponent } from '../../../../components/sparkline/sparkline.component';

@Component({
  selector: 'app-home-primary-panel',
  standalone: true,
  imports: [CommonModule, SparklineComponent],
  templateUrl: './home-primary-panel.component.html',
  styleUrl: './home-primary-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePrimaryPanelComponent {
  @Input({ required: true }) topPicks$!: Observable<StockPick[]>;
  @Output() selectStock = new EventEmitter<string>();
}
