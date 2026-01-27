import { createFeature, createReducer, on } from '@ngrx/store';
import { StockDetail, StockDetailUpdate } from '../../models';
import { StockActions } from './stock.actions';

export const stockDetailFeatureKey = 'stockDetail';

export type StockDetailStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StockDetailState {
  detail: StockDetail | null;
  liveUpdate: StockDetailUpdate | null;
  status: StockDetailStatus;
  error: string | null;
}

const initialState: StockDetailState = {
  detail: null,
  liveUpdate: null,
  status: 'idle',
  error: null
};

type IncomingStockDetail = StockDetail | StockDetailUpdate | { data: StockDetail | StockDetailUpdate };

type WithData = { data: StockDetail | StockDetailUpdate };

const hasData = (incoming: IncomingStockDetail): incoming is WithData => {
  return typeof (incoming as WithData).data !== 'undefined' && (incoming as WithData).data !== null;
};

const pickPayload = (incoming: IncomingStockDetail): StockDetail | StockDetailUpdate =>
  hasData(incoming) ? incoming.data : incoming;

const normalizeStockDetail = (incoming: IncomingStockDetail, existing?: StockDetail): StockDetail => {
  const raw = pickPayload(incoming);
  const merged = { ...(existing ?? {}), ...raw } as Partial<StockDetail>;
  const symbol = ('symbol' in raw ? raw.symbol : undefined) ?? existing?.symbol ?? '';
  const updatedAt = ('updatedAt' in raw ? raw.updatedAt : undefined) ?? existing?.updatedAt ?? Date.now();
  return { ...(merged as StockDetail), symbol, updatedAt };
};

export const stockDetailFeature = createFeature({
  name: stockDetailFeatureKey,
  reducer: createReducer(
    initialState,
    on(StockActions.resetDetail, () => initialState),
    on(StockActions.loadDetail, (state): StockDetailState => ({
      ...state,
      liveUpdate: null,
      status: 'loading',
      error: null
    })),
    on(StockActions.loadDetailSuccess, (state, { detail }): StockDetailState => ({
      ...state,
      detail: normalizeStockDetail(detail),
      liveUpdate: null,
      status: 'success',
      error: null
    })),
    on(StockActions.liveQuoteUpdate, (state, { update }): StockDetailState => {
      if (!state.detail || !update.price || !state.detail.previousClose) {
        return state;
      }
      if (update.symbol !== state.detail.symbol) {
        return state;
      }
      return {
        ...state,
        liveUpdate: update,
      };
    }),
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
  selectError,
  selectLiveUpdate,
} = stockDetailFeature;
