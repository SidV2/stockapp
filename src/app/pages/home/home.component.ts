import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { HomePrimaryPanelComponent } from './components/primary-panel/home-primary-panel.component';
import { HomeHeaderComponent } from './components/header/home-header.component';
import { TopPicksActions } from '../../store/top-picks/top-picks.actions';
import { selectTopPicks } from '../../store/top-picks/top-picks.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchPanelComponent,
    HomePrimaryPanelComponent,
    HomeHeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly topPicks = toSignal(this.store.select(selectTopPicks), { initialValue: [] });

  constructor(
    private readonly router: Router,
    private readonly store: Store
  ) {
    this.store.dispatch(TopPicksActions.loadTopPicks());
  }

  viewDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
