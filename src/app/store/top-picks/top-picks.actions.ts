import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StockPick } from '../../models/stock.models';

export const TopPicksActions = createActionGroup({
  source: 'Top Picks',
  events: {
    'Load Top Picks': emptyProps(),
    'Refresh Top Picks': emptyProps(),
    'Load Top Picks Success': props<{ picks: StockPick[] }>(),
    'Load Top Picks Failure': props<{ error: string }>()
  }
});
