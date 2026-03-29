import { createSelector } from '@ngrx/store';
import { stockDetailFeature } from './stock.reducer';

const {
  selectDetail,
  selectStatus,
  selectError,
} = stockDetailFeature;

export const selectStockDetail = createSelector(
  selectDetail,
  (detail) => detail
);

export const selectStockDetailStatus = createSelector(
  selectStatus,
  (status) => status
);

export const selectIsStockDetailLoading = createSelector(
  selectStockDetailStatus,
  selectStockDetail,
  (status, detail) => status === 'loading' && !detail
);

export const selectStockDetailError = createSelector(
  selectError,
  (error) => error
);

