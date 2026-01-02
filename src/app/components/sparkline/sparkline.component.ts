import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, computed, effect, input } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sparkline.component.html',
  styleUrls: ['./sparkline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SparklineComponent {
  // Modern signal inputs
  readonly values = input<number[] | undefined>([]);
  readonly width = input<number>(120);
  readonly height = input<number>(32);
  readonly stroke = input<string>('#0a7d22');

  private readonly smoothing = 0.18;

  // Computed signal for path generation
  readonly path = computed(() => this.generatePath());

  private generatePath(): string {
    const values = this.values();
    const width = this.width();
    const height = this.height();

    if (!values || values.length === 0) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / Math.max(values.length - 1, 1);

    // Pre-allocate array for better performance
    const points: Point[] = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      points[i] = {
        x: i * stepX,
        y: height - ((values[i] - min) / range) * height
      };
    }

    // Build path string efficiently
    const pathParts: string[] = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const previous = points[i - 1];
      const previousPrevious = points[i - 2];
      const next = points[i + 1];

      const controlPointStart = this.getControlPoint(previous, previousPrevious, point);
      const controlPointEnd = this.getControlPoint(point, previous, next, true);

      pathParts.push(
        `C ${controlPointStart.x} ${controlPointStart.y} ${controlPointEnd.x} ${controlPointEnd.y} ${point.x} ${point.y}`
      );
    }

    return pathParts.join(' ');
  }

  private getControlPoint(
    current: Point,
    previous: Point | undefined,
    next: Point | undefined,
    reverse = false
  ): Point {
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

