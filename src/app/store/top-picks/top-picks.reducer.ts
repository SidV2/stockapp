import { createFeature, createReducer, on } from '@ngrx/store';
import { StockPick } from '../../models/stock.models';
import { TopPicksActions } from './top-picks.actions';

export const topPicksFeatureKey = 'topPicks';

export type TopPicksStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TopPicksState {
  picks: StockPick[];
  status: TopPicksStatus;
  error: string | null;
}

const initialState: TopPicksState = {
  picks: [],
  status: 'idle',
  error: null
};

export const topPicksFeature = createFeature({
  name: topPicksFeatureKey,
  reducer: createReducer(
    initialState,
    on(TopPicksActions.loadTopPicks, (): TopPicksState => ({
      ...initialState,
      status: 'loading'
    })),
    on(TopPicksActions.refreshTopPicks, (state): TopPicksState => ({
      ...state,
      status: 'loading',
      error: null
    })),
    on(TopPicksActions.loadTopPicksSuccess, (_, { picks }): TopPicksState => ({
      picks,
      status: 'success',
      error: null
    })),
    on(TopPicksActions.loadTopPicksFailure, (state, { error }): TopPicksState => ({
      ...state,
      status: 'error',
      error
    }))
  )
});

export const {
  name: topPicksFeatureName,
  reducer: topPicksReducer,
  selectPicks,
  selectStatus: selectTopPicksStatus,
  selectError: selectTopPicksError
} = topPicksFeature;
