import { createFeature, createReducer, on } from '@ngrx/store';
import { StockDetail } from '../../models/stock.models';
import { StockActions } from './stock.actions';

export const stockDetailFeatureKey = 'stockDetail';

export type StockDetailStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StockDetailState {
  detail: StockDetail | null;
  status: StockDetailStatus;
  error: string | null;
}

const initialState: StockDetailState = {
  detail: null,
  status: 'idle',
  error: null
};

export const stockDetailFeature = createFeature({
  name: stockDetailFeatureKey,
  reducer: createReducer(
    initialState,
    on(StockActions.resetDetail, () => initialState),
    on(StockActions.loadDetail, (state): StockDetailState => ({
      ...state,
      status: 'loading',
      error: null
    })),
    on(StockActions.loadDetailSuccess, (state, { detail }): StockDetailState => ({
      ...state,
      detail,
      status: 'success',
      error: null
    })),
    on(StockActions.loadDetailFailure, (state, { error }): StockDetailState => ({
      ...state,
      status: 'error',
      error
    }))
  )
});

export const {
  name: stockDetailFeatureName,
  reducer: stockDetailReducer,
  selectStockDetailState,
  selectDetail,
  selectStatus,
  selectError
} = stockDetailFeature;
