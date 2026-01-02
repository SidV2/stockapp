import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  readonly results = input.required<StockResult[]>();
  readonly asOf = input.required<number | undefined>();
  readonly selectStock = output<string>();
}
