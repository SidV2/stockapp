import { Component, ChangeDetectionStrategy, OnDestroy, AfterViewInit, input, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, ChartDataset } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

@Component({
  selector: 'app-sparkline',
  standalone: true,
  template: `
    <div class="sparkline-container" [style.height.px]="height()">
      <canvas #canvas aria-label="sparkline" role="img"></canvas>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; padding: 1rem 0; }
    .sparkline-container { position: relative; width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SparklineComponent implements AfterViewInit, OnDestroy {
  readonly values = input<number[] | undefined>([]);
  readonly height = input<number>(32);
  readonly stroke = input<string>('#0a7d22');

  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor() {
    combineLatest([toObservable(this.values), toObservable(this.stroke)])
      .pipe(takeUntilDestroyed())
      .subscribe(([values, stroke]) => {
        if (this.chart) this.updateChart(values, stroke);
      });
  }

  ngAfterViewInit(): void {
    const data = this.normalizeValues(this.values());
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [this.buildDataset(this.values(), this.stroke())]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeOutCubic' },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 },
          line: { borderWidth: 2, tension: 0.4 }
        }
      }
    });
  }

  private normalizeValues(values: number[] | undefined): number[] {
    if (!values || values.length === 0) return [];
    if (values.length === 1) return [values[0], values[0]];
    return values;
  }

  private buildDataset(values: number[] | undefined, stroke: string): ChartDataset<'line'> {
    const data = this.normalizeValues(values);
    return {
      data,
      borderColor: stroke,
      fill: false,
      pointRadius: 0
    };
  }

  private updateChart(values: number[] | undefined, stroke: string): void {
    const data = this.normalizeValues(values);
    const dataset = this.chart!.data.datasets[0];
    dataset.data = data;
    (dataset as ChartDataset<'line'>).borderColor = stroke;
    this.chart!.data.labels = data.map((_, i) => i);
    this.chart!.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }
}
