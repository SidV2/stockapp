import { createSelector } from '@ngrx/store';
import { topPicksFeature } from './top-picks.reducer';

const {
  selectPicks,
  selectStatus,
  selectError
} = topPicksFeature;

export const selectTopPicks = createSelector(
  selectPicks,
  (picks) => picks
);

export const selectTopPicksStatus = createSelector(
  selectStatus,
  (status) => status
);

export const selectIsTopPicksLoading = createSelector(
  selectTopPicksStatus,
  selectTopPicks,
  (status, picks) => status === 'loading' && picks.length === 0
);

export const selectTopPicksError = createSelector(
  selectError,
  (error) => error
);
