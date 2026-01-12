import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AiStockAnalyzerService } from '../../services/ai-stock-analyzer.service';
import { AiAdvisorActions } from './ai-advisor.actions';

@Injectable()
export class AiAdvisorEffects {
  analyzeStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AiAdvisorActions.analyzeStock),
      tap(({ stockDetail }) => {
        console.log('🤖 Effect: Starting AI analysis for', stockDetail.symbol);
      }),
      switchMap(({ stockDetail }) =>
        this.aiAnalyzer.analyzeStock(stockDetail).pipe(
          map(analysis => {
            console.log('✅ Effect: Analysis completed for', stockDetail.symbol);
            return AiAdvisorActions.analyzeStockSuccess({ 
              analysis, 
              symbol: stockDetail.symbol 
            });
          }),
          catchError((error: Error) => {
            console.error('❌ Effect: Analysis failed', error);
            return of(AiAdvisorActions.analyzeStockFailure({ 
              error: error.message || 'Failed to analyze stock' 
            }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private aiAnalyzer: AiStockAnalyzerService
  ) {}
}
