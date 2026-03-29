import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { HomeComponent } from './pages/home/home.component';
import { topPicksFeatureName, topPicksReducer } from './store/top-picks/top-picks.reducer';
import { TopPicksEffects } from './store/top-picks/top-picks.effects';
import { stockDetailFeatureName, stockDetailReducer } from './store/stock/stock.reducer';
import { StockEffects } from './store/stock/stock.effects';
import { StockDetailService } from './services/stock-detail.service';
import { stockHistoryFeatureName, stockHistoryReducer } from './store/stock-history/stock-history.reducer';
import { StockHistoryEffects } from './store/stock-history/stock-history.effects';
import { aiAdvisorFeatureName, aiAdvisorReducer } from './store/ai-advisor/ai-advisor.reducer';
import { AiAdvisorEffects } from './store/ai-advisor/ai-advisor.effects';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    providers: [
      provideState(topPicksFeatureName, topPicksReducer),
      provideEffects(TopPicksEffects)
    ]
  },
  {
    path: 'stocks/:symbol',
    loadComponent: () => import('./pages/stock-detail/stock-detail.component').then(m => m.StockDetailComponent),
    providers: [
      provideState(stockDetailFeatureName, stockDetailReducer),
      provideState(stockHistoryFeatureName, stockHistoryReducer),
      provideState(aiAdvisorFeatureName, aiAdvisorReducer),
      StockDetailService,
      provideEffects(StockEffects, StockHistoryEffects, AiAdvisorEffects)
    ]
  },
  { path: '**', redirectTo: '' }
];
