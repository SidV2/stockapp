import { createSelector } from '@ngrx/store';
import { stockHistoryFeature } from './stock-history.reducer';

const {
  selectHistory,
  selectStatus,
  selectError
} = stockHistoryFeature;

export const selectStockHistory = createSelector(
  selectHistory,
  (history) => history
);

export const selectStockHistoryStatus = createSelector(
  selectStatus,
  (status) => status
);

export const selectIsStockHistoryLoading = createSelector(
  selectStockHistoryStatus,
  selectStockHistory,
  (status, history) => status === 'loading' && !history
);

export const selectStockHistoryError = createSelector(
  selectError,
  (error) => error
);
