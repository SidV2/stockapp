import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TopPicksActions } from '../../../../store/top-picks/top-picks.actions';
import { selectTopPicks } from '../../../../store/top-picks/top-picks.selectors';
import { HomePrimaryPanelComponent } from './home-primary-panel.component';

@Component({
  selector: 'app-home-primary-panel-container',
  standalone: true,
  imports: [HomePrimaryPanelComponent],
  template: `
    <app-home-primary-panel
      [topPicks]="topPicks()"
      (selectStock)="onSelectStock($event)"
    ></app-home-primary-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePrimaryPanelContainerComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly topPicks = toSignal(this.store.select(selectTopPicks), { initialValue: [] });

  constructor() {
    this.store.dispatch(TopPicksActions.loadTopPicks());
  }

  onSelectStock(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
