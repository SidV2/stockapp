import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { StockEffects } from './store/stock/stock.effects';
import { stockDetailFeatureName, stockDetailReducer } from './store/stock/stock.reducer';
import { StockHistoryEffects } from './store/stock-history/stock-history.effects';
import { stockHistoryFeatureName, stockHistoryReducer } from './store/stock-history/stock-history.reducer';
import { TopPicksEffects } from './store/top-picks/top-picks.effects';
import { topPicksFeatureName, topPicksReducer } from './store/top-picks/top-picks.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      [stockDetailFeatureName]: stockDetailReducer,
      [topPicksFeatureName]: topPicksReducer,
      [stockHistoryFeatureName]: stockHistoryReducer
    }),
    provideRouterStore(),
    provideEffects([StockEffects, TopPicksEffects, StockHistoryEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode()
    }),
    provideHttpClient()
  ]
};
