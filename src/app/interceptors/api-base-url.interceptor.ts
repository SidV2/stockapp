import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { apiBaseUrl } from '../../constants/api.constants';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.startsWith('http') ? req.url : `${apiBaseUrl}${req.url}`;
  return next(req.clone({ url }));
};

export const timingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  return next(req).pipe(
    tap({
      complete: () => console.log(`[HTTP] ${req.method} ${req.url} — ${Date.now() - start}ms`),
      error: () => console.warn(`[HTTP] ${req.method} ${req.url} — failed after ${Date.now() - start}ms`)
    })
  );
};
