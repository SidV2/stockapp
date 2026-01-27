import { createFeature, createReducer, on } from '@ngrx/store';
import { StockHistory } from '../../models';
import { StockHistoryActions } from './stock-history.actions';

export const stockHistoryFeatureKey = 'stockHistory';

export type StockHistoryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StockHistoryState {
  history: StockHistory | null;
  status: StockHistoryStatus;
  error: string | null;
}

const initialState: StockHistoryState = {
  history: null,
  status: 'idle',
  error: null
};

export const stockHistoryFeature = createFeature({
  name: stockHistoryFeatureKey,
  reducer: createReducer(
    initialState,
    on(StockHistoryActions.loadHistory, (state): StockHistoryState => ({
      ...state,
      status: 'loading',
      error: null
    })),
    on(StockHistoryActions.loadHistorySuccess, (state, { history }): StockHistoryState => ({
      ...state,
      history: history,
      status: 'success',
      error: null
    })),
    on(StockHistoryActions.loadHistoryFailure, (state, { error }): StockHistoryState => ({
      ...state,
      status: 'error',
      error
    }))
  )
});

export const {
  name: stockHistoryFeatureName,
  reducer: stockHistoryReducer,
  selectStockHistoryState,
  selectHistory,
  selectStatus,
  selectError
} = stockHistoryFeature;
