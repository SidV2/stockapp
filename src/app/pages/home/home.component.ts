import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { HomePrimaryPanelComponent } from './components/primary-panel/home-primary-panel.component';
import { HomeHeaderComponent } from './components/header/home-header.component';
import { TopPicksActions } from '../../store/top-picks/top-picks.actions';
import { selectTopPicks } from '../../store/top-picks/top-picks.selectors';
import { HomeMarketService } from '../../services/home-market.service';

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
  // Convert observables to signals
  readonly asOf = toSignal(this.homeMarketService.getAsOf());
  readonly topPicks = toSignal(this.store.select(selectTopPicks), { initialValue: [] });
  readonly results = toSignal(this.homeMarketService.getResults(), { initialValue: [] });

  // Constants
  readonly timeframes: string[] = ['1D', '5D', '5M', '1Y', '3Y', '5Y'];
  readonly viewPresets = [
    { id: 'mobile', label: 'Mobile' },
    { id: 'desktop', label: 'Desktop' }
  ];

  // Local state as signals
  readonly activeView = signal('desktop');
  readonly selectedTimeframe = signal(this.timeframes[0]);

  constructor(
    private readonly router: Router,
    private readonly store: Store,
    private readonly homeMarketService: HomeMarketService
  ) {
    // Dispatch on construction instead of ngOnInit
    this.store.dispatch(TopPicksActions.loadTopPicks());
  }

  setTimeframe(timeframe: string): void {
    this.selectedTimeframe.set(timeframe);
  }

  setView(viewId: string): void {
    this.activeView.set(viewId);
  }

  viewDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
