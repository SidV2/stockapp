import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { HomePrimaryPanelComponent } from './components/primary-panel/home-primary-panel.component';
import { HomeSecondaryPanelComponent } from './components/secondary-panel/home-secondary-panel.component';
import { HomeHeaderComponent } from './components/header/home-header.component';
import { StockPick, StockResult } from '../../models/stock.models';
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
    HomeSecondaryPanelComponent,
    HomeHeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  readonly asOf$: Observable<number> = this.homeMarketService.getAsOf();
  readonly topPicks$: Observable<StockPick[]> = this.store.select(selectTopPicks);
  readonly results$: Observable<StockResult[]> = this.homeMarketService.getResults();

  readonly timeframes = ['1D', '5D', '5M', '1Y', '3Y', '5Y'];
  readonly viewPresets = [
    { id: 'mobile', label: 'Mobile' },
    { id: 'desktop', label: 'Desktop' }
  ];

  activeView = 'desktop';
  selectedTimeframe = this.timeframes[0];

  constructor(
    private readonly router: Router,
    private readonly store: Store,
    private readonly homeMarketService: HomeMarketService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(TopPicksActions.loadTopPicks());
  }

  setTimeframe(timeframe: string): void {
    this.selectedTimeframe = timeframe;
  }

  setView(viewId: string): void {
    this.activeView = viewId;
  }

  viewDetail(symbol: string): void {
    this.router.navigate(['/stocks', symbol]);
  }
}
