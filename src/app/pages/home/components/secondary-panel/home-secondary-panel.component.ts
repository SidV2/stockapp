import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { StockResult } from '../../../../models/stock.models';

@Component({
  selector: 'app-home-secondary-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-secondary-panel.component.html',
  styleUrl: './home-secondary-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSecondaryPanelComponent {
  @Input({ required: true }) results$!: Observable<StockResult[]>;
  @Input({ required: true }) asOf$!: Observable<number>;
  @Output() selectStock = new EventEmitter<string>();
}
