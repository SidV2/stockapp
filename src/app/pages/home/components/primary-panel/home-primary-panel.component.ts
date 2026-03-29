import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StockPick } from '../../../../models';

@Component({
  selector: 'app-home-primary-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-primary-panel.component.html',
  styleUrl: './home-primary-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePrimaryPanelComponent {
  readonly topPicks = input.required<StockPick[]>();
  readonly selectStock = output<string>();
}
