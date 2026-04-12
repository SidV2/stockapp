import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiBaseUrlInterceptor, timingInterceptor } from './interceptors/api-base-url.interceptor';
import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideStore(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode()
    }),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, timingInterceptor]))
  ]
};
