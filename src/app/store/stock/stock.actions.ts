import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StockDetail } from '../../models/stock.models';

export const StockActions = createActionGroup({
  source: 'Stock Detail',
  events: {
    'Load Detail': props<{ symbol: string }>(),
    'Load Detail Success': props<{ detail: StockDetail }>(),
    'Load Detail Failure': props<{ error: string }>(),
    'Reset Detail': emptyProps()
  }
});
