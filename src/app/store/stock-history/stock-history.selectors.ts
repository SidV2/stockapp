import { createSelector } from '@ngrx/store';
import { stockHistoryFeature } from './stock-history.reducer';

export const selectStockHistory = stockHistoryFeature.selectHistory;
export const selectStockHistoryStatus = stockHistoryFeature.selectStatus;
export const selectStockHistoryError = stockHistoryFeature.selectError;

export const selectIsStockHistoryLoading = createSelector(
  selectStockHistoryStatus,
  selectStockHistory,
  (status, history) => status === 'loading' && !history
);

export const selectIsStockHistoryLoaded = createSelector(
  selectStockHistoryStatus,
  (status) => status === 'success'
);
