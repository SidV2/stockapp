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
  
  // Cache these values to avoid recalculation
  private cachedMin = 0;
  private cachedMax = 0;
  private cachedValuesLength = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.values && this.values.length) {
      // Only regenerate if values actually changed
      const valuesChanged = changes['values']?.currentValue !== changes['values']?.previousValue;
      const dimensionsChanged = changes['width'] || changes['height'];
      
      if (valuesChanged || dimensionsChanged) {
        this.path = this.generatePath(this.values, this.width, this.height);
      }
    }
  }

  private generatePath(values: number[], width: number, height: number): string {
    if (!values || values.length === 0) return '';
    
    // Use cached min/max if length hasn't changed (for incremental updates)
    if (values.length !== this.cachedValuesLength) {
      this.cachedMin = Math.min(...values);
      this.cachedMax = Math.max(...values);
      this.cachedValuesLength = values.length;
    }
    
    const range = this.cachedMax - this.cachedMin || 1;
    const stepX = width / Math.max(values.length - 1, 1);

    // Pre-allocate array for better performance
    const points = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      points[i] = {
        x: i * stepX,
        y: height - ((values[i] - this.cachedMin) / range) * height
      };
    }

    // Build path string more efficiently using array join
    const pathParts: string[] = [`M ${points[0].x} ${points[0].y}`];
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const previous = points[i - 1];
      const previousPrevious = points[i - 2];
      const next = points[i + 1];
      
      const controlPointStart = this.getControlPoint(previous, previousPrevious, point);
      const controlPointEnd = this.getControlPoint(point, previous, next, true);
      
      pathParts.push(`C ${controlPointStart.x} ${controlPointStart.y} ${controlPointEnd.x} ${controlPointEnd.y} ${point.x} ${point.y}`);
    }
    
    return pathParts.join(' ');
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

