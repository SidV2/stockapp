import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-about-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-panel.component.html',
  styleUrl: './about-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPanelComponent {
  @Input({ required: true }) company = '';
  @Input({ required: true }) description = '';
}
