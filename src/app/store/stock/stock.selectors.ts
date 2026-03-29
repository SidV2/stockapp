import { createSelector } from '@ngrx/store';
import { stockDetailFeature } from './stock.reducer';
import { StockDetail } from '../../models';

const {
  selectDetail,
  selectLiveUpdate,
  selectStatus,
  selectError,
  selectLiveHistory: selectLiveHistoryFromFeature
} = stockDetailFeature;

export const selectStockDetail = createSelector(
  selectDetail,
  (detail) => detail
);

export const selectLiveStock = createSelector(
  selectDetail,
  selectLiveUpdate,
  (detail, liveUpdate): StockDetail | null => {
    if (!detail) return null;
    if (!liveUpdate || liveUpdate.price === undefined) return detail;
    return {
      ...detail,
      price: liveUpdate.price,
      change: liveUpdate.price - detail.previousClose,
      changePercent: (liveUpdate.price - detail.previousClose) / detail.previousClose,
      updatedAt: liveUpdate.updatedAt ?? detail.updatedAt
    };
  }
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

export const selectLiveHistory = createSelector(
  selectLiveHistoryFromFeature,
  (history) => history
);
