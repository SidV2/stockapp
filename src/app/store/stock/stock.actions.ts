import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StockDetail, StockDetailUpdate } from '../../models';

export const StockActions = createActionGroup({
  source: 'Stock Detail',
  events: {
    'Load Detail': props<{ symbol: string }>(),
    'Load Detail Success': props<{ detail: StockDetail }>(),
    'Load Detail Failure': props<{ error: string }>(),
    'Live Quote Update': props<{ update: StockDetailUpdate }>(),
    'Reset Detail': emptyProps()
  }
});
