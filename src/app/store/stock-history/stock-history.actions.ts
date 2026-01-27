import { createActionGroup, props } from '@ngrx/store';
import { HistoryRange, StockHistory } from '../../models';

export const StockHistoryActions = createActionGroup({
  source: 'Stock History',
  events: {
    'Load History': props<{ symbol: string; range: HistoryRange }>(),
    'Load History Success': props<{ history: StockHistory }>(),
    'Load History Failure': props<{ error: string }>(),
  }
});
