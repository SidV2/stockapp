import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, computed, effect, input, signal } from '@angular/core';

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
  
  // Animated path signal for smooth transitions
  readonly path = signal<string>('');
  
  // Track animation state
  private animationId?: number;
  private previousPoints: Point[] = [];
  private targetPoints: Point[] = [];
  
  // Computed signal for target path generation
  private readonly targetPath = computed(() => this.generatePath());

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef
  ) {
    // Watch for changes in target path and animate
    effect(() => {
      const newPath = this.targetPath();
      const newPoints = this.generatePoints();
      
      if (newPoints.length > 0) {
        this.animateToNewPath(newPoints);
      } else {
        this.path.set('');
      }
    }, { allowSignalWrites: true });
    
    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    });
  }

  private generatePoints(): Point[] {
    const values = this.values();
    const width = this.width();
    const height = this.height();

    if (!values || values.length === 0) return [];

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

    return points;
  }

  private generatePath(): string {
    const points = this.generatePoints();
    if (points.length === 0) return '';
    return this.pointsToPath(points);
  }
  
  private pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';
    
    // Build path string efficiently
    const pathParts: string[] = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const previous = points[i - 1];
      const previousPrevious = points[i - 2];
      const next = points[i + 1];

      const controlPointStart = this.getControlPoint(previous, previousPrevious, point);
      const controlPointEnd = this.getControlPoint(point, previous, next, true);

      pathParts.push(
        `C ${controlPointStart.x.toFixed(2)} ${controlPointStart.y.toFixed(2)} ${controlPointEnd.x.toFixed(2)} ${controlPointEnd.y.toFixed(2)} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      );
    }

    return pathParts.join(' ');
  }
  
  private animateToNewPath(newPoints: Point[]): void {
    // Cancel any existing animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // If no previous points, set immediately
    if (this.previousPoints.length === 0) {
      this.previousPoints = newPoints;
      this.targetPoints = newPoints;
      this.path.set(this.pointsToPath(newPoints));
      this.cdr.markForCheck();
      return;
    }
    
    // Store target points
    this.targetPoints = newPoints;
    
    // Animate from previous to target
    const startTime = performance.now();
    const duration = 400; // ms
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate points
      const interpolatedPoints = this.interpolatePoints(
        this.previousPoints,
        this.targetPoints,
        easeProgress
      );
      
      // Generate and set path
      this.path.set(this.pointsToPath(interpolatedPoints));
      
      // Trigger change detection for OnPush strategy
      this.cdr.markForCheck();
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.previousPoints = this.targetPoints;
        this.animationId = undefined;
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  private interpolatePoints(from: Point[], to: Point[], progress: number): Point[] {
    // Handle different array lengths by padding or truncating
    const maxLength = Math.max(from.length, to.length);
    const minLength = Math.min(from.length, to.length);
    
    const result: Point[] = new Array(to.length);
    
    for (let i = 0; i < to.length; i++) {
      const fromPoint = from[i] ?? to[i];
      const toPoint = to[i];
      
      result[i] = {
        x: fromPoint.x + (toPoint.x - fromPoint.x) * progress,
        y: fromPoint.y + (toPoint.y - fromPoint.y) * progress
      };
    }
    
    return result;
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

