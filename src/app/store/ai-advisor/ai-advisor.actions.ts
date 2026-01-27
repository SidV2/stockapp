import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StockAnalysis, StockDetail } from '../../models';

export const AiAdvisorActions = createActionGroup({
  source: 'AI Advisor',
  events: {
    'Analyze Stock': props<{ stockDetail: StockDetail }>(),
    'Analyze Stock Success': props<{ analysis: StockAnalysis; symbol: string }>(),
    'Analyze Stock Failure': props<{ error: string }>(),
    'Reset Analysis': emptyProps(),
  }
});
