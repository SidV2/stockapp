import { createSelector } from '@ngrx/store';
import {
  selectPicks as selectTopPicksFromFeature,
  selectTopPicksStatus as selectTopPicksStatusFromFeature,
  selectTopPicksError as selectTopPicksErrorFromFeature
} from './top-picks.reducer';

export const selectTopPicks = selectTopPicksFromFeature;
export const selectTopPicksStatus = selectTopPicksStatusFromFeature;
export const selectTopPicksError = selectTopPicksErrorFromFeature;

export const selectAreTopPicksLoading = createSelector(
  selectTopPicksStatus,
  (status) => status === 'loading'
);

export const selectHaveTopPicksLoaded = createSelector(
  selectTopPicksStatus,
  (status) => status === 'success'
);
