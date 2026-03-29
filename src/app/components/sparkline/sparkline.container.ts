import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SparklineComponent } from './sparkline.component';

@Component({
  selector: 'app-sparkline-container',
  standalone: true,
  imports: [SparklineComponent],
  template: `
    <app-sparkline
      [values]="values()"
      [height]="height()"
      [stroke]="stroke()"
    ></app-sparkline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SparklineContainerComponent {
  readonly values = input<number[] | undefined>(undefined);
  readonly height = input<number>(32);

  // Business logic: chart colour determined by trend direction
  readonly stroke = computed(() => {
    const vals = this.values();
    if (!vals || vals.length < 2) return '#6b7280';
    return vals[vals.length - 1] >= vals[0] ? '#16a34a' : '#dc2626';
  });
}
