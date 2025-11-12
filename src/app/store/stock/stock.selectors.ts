import { createSelector } from '@ngrx/store';
import { stockDetailFeature } from './stock.reducer';

export const selectStockDetail = stockDetailFeature.selectDetail;
export const selectStockDetailStatus = stockDetailFeature.selectStatus;
export const selectStockDetailError = stockDetailFeature.selectError;

export const selectIsStockDetailLoading = createSelector(
  selectStockDetailStatus,
  selectStockDetail,
  (status, detail) => status === 'loading' && !detail
);

export const selectIsStockDetailLoaded = createSelector(
  selectStockDetailStatus,
  (status) => status === 'success'
);
