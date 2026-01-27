import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StockPick } from '../../../../models';
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
  readonly topPicks = input.required<StockPick[]>();
  readonly selectStock = output<string>();
}
