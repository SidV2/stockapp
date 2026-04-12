import { Component, ChangeDetectionStrategy, OnDestroy, AfterViewInit, input, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, ChartDataset } from 'chart.js';
import { hexToRgb } from '../../utils/stock.utils';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

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
    canvas { display: block; width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SparklineComponent implements AfterViewInit, OnDestroy {
  readonly values = input<number[] | undefined>([]);
  readonly height = input<number>(32);
  readonly stroke = input<string>('#0a7d22');

  readonly hexToRgb =  hexToRgb;

  @ViewChild('canvas') 
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;

  private readonly crosshairPlugin = {
    id: 'crosshair',
    afterDraw: (chart: Chart) => {
      const tooltip = (chart as any).tooltip;
      if (!tooltip || tooltip.getActiveElements().length === 0) return;
      const x = tooltip.getActiveElements()[0].element.x;
      const ctx = chart.ctx;
      const topY = chart.scales['y'].top;
      const bottomY = chart.scales['y'].bottom;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }
  };

  constructor() {
    combineLatest([toObservable(this.values), toObservable(this.stroke)])
      .pipe(takeUntilDestroyed())
      .subscribe(([values, stroke]) => {
        if (this.chart) this.updateChart(values, stroke);
      });
  }

  ngAfterViewInit(): void {
    const isLarge = this.height() > 100;
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
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: isLarge ? {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              title: () => '',
              label: (ctx) => ` $${(ctx.parsed.y as number).toFixed(2)}`
            }
          } : { enabled: false }
        },
        scales: {
          x: { display: false },
          y: {
            display: isLarge,
            position: 'left',
            grid: { display: false },
            border: { display: false },
            ticks: {
              maxTicksLimit: 2,
              callback: (val) => `$${(val as number).toFixed(0)}`,
              color: '#94a3b8',
              font: { size: 11 }
            }
          }
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: isLarge ? 5 : 0,
            hoverBackgroundColor: this.stroke(),
            hoverBorderColor: '#fff',
            hoverBorderWidth: 2
          },
          line: { borderWidth: 2, tension: 0.4 }
        }
      },
      plugins: isLarge ? [this.crosshairPlugin] : []
    });
  }

  private normalizeValues(values: number[] | undefined): number[] {
    if (!values || values.length === 0) return [];
    if (values.length === 1) return [values[0], values[0]];
    return values;
  }

  private buildDataset(values: number[] | undefined, stroke: string): ChartDataset<'line'> {
    const data = this.normalizeValues(values);
    const backgroundColor = this.buildGradient(stroke);
    return {
      data,
      borderColor: stroke,
      backgroundColor,
      fill: true,
      pointRadius: 0
    };
  }

  private buildGradient(stroke: string): CanvasGradient | string {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return stroke + '15';
    const ctx = canvas.getContext('2d');
    if (!ctx) return stroke + '15';
    const rgb = this.hexToRgb(stroke);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height());
    gradient.addColorStop(0, `rgba(${rgb}, 0.25)`);
    gradient.addColorStop(0.7, `rgba(${rgb}, 0.05)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    return gradient;
  }


  private updateChart(values: number[] | undefined, stroke: string): void {
    const data = this.normalizeValues(values);
    const dataset = this.chart!.data.datasets[0] as ChartDataset<'line'>;
    dataset.data = data;
    dataset.borderColor = stroke;
    dataset.backgroundColor = this.buildGradient(stroke);
    this.chart!.data.labels = data.map((_, i) => i);
    this.chart!.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }
}
