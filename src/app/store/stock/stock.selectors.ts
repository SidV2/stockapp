import { createSelector } from '@ngrx/store';
import { stockDetailFeature } from './stock.reducer';
import { StockDetail } from '../../models';

const selectStockDetail = stockDetailFeature.selectDetail;
const selectStockLiveUpdate = stockDetailFeature.selectLiveUpdate;
const selectStockDetailStatus = stockDetailFeature.selectStatus;

export const selectStockDetailError = stockDetailFeature.selectError;

export const selectIsStockDetailLoading = createSelector(
  selectStockDetailStatus,
  selectStockDetail,
  (status, detail) => status === 'loading' && !detail
);

export const selectLiveStock = createSelector(
  selectStockDetail,
  selectStockLiveUpdate,
  (detail, liveUpdate): StockDetail | null => {
    if (!detail) {
      return null;
    }
    if (!liveUpdate || liveUpdate.price === undefined) {
      return detail;
    }
    return {
      ...detail,
      price: liveUpdate.price,
      change: liveUpdate.price - detail.previousClose,
      changePercent: (liveUpdate.price - detail.previousClose) / detail.previousClose,
      updatedAt: liveUpdate.updatedAt ?? detail.updatedAt
    };
  }
);
