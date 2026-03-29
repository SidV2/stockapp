import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SearchPanelComponent } from './search-panel.component';

@Component({
  selector: 'app-search-panel-container',
  standalone: true,
  imports: [SearchPanelComponent],
  template: `<app-search-panel (symbolSelected)="onSymbolSelected($event)"></app-search-panel>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelContainerComponent {
  private readonly router = inject(Router);

  onSymbolSelected(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
