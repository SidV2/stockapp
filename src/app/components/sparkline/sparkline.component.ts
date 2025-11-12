import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sparkline.component.html',
  styleUrls: ['./sparkline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SparklineComponent implements OnChanges {
  @Input() values: number[] | undefined = [];
  @Input() width = 120;
  @Input() height = 32;
  @Input() stroke = '#0a7d22';

  path = '';
  private readonly smoothing = 0.18;

  ngOnChanges(_: SimpleChanges): void {
    if(this.values && this.values.length)
    this.path = this.generatePath(this.values, this.width, this.height);
  }

  private generatePath(values: number[], width: number, height: number): string {
    if (!values || values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / Math.max(values.length - 1, 1);

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return { x, y };
    });

    return points.reduce((path, point, index, arr) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = arr[index - 1];
      const previousPrevious = arr[index - 2];
      const next = arr[index + 1];
      const controlPointStart = this.getControlPoint(previous, previousPrevious, point);
      const controlPointEnd = this.getControlPoint(point, previous, next, true);

      return `${path} C ${controlPointStart.x} ${controlPointStart.y} ${controlPointEnd.x} ${controlPointEnd.y} ${point.x} ${point.y}`;
    }, '');
  }

  private getControlPoint(
    current: { x: number; y: number },
    previous?: { x: number; y: number },
    next?: { x: number; y: number },
    reverse = false
  ): { x: number; y: number } {
    const p = previous ?? current;
    const n = next ?? current;
    const angle = Math.atan2(n.y - p.y, n.x - p.x) + (reverse ? Math.PI : 0);
    const length = Math.hypot(n.x - p.x, n.y - p.y) * this.smoothing;
    return {
      x: current.x + Math.cos(angle) * length,
      y: current.y + Math.sin(angle) * length
    };
  }
}

