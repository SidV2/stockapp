import { createFeature, createReducer, on } from '@ngrx/store';
import { StockAnalysis } from '../../services/ai-stock-analyzer.service';
import { AiAdvisorActions } from './ai-advisor.actions';

export interface AiAdvisorState {
  analysis: StockAnalysis | null;
  symbol: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastAnalyzedAt: number | null;
}

const initialState: AiAdvisorState = {
  analysis: null,
  symbol: null,
  status: 'idle',
  error: null,
  lastAnalyzedAt: null
};

export const aiAdvisorFeature = createFeature({
  name: 'aiAdvisor',
  reducer: createReducer(
    initialState,
    
    on(AiAdvisorActions.analyzeStock, (state, { stockDetail }) => ({
      ...state,
      status: 'loading' as const,
      error: null,
      symbol: stockDetail.symbol
    })),
    
    on(AiAdvisorActions.analyzeStockSuccess, (state, { analysis, symbol }) => ({
      ...state,
      analysis,
      symbol,
      status: 'success' as const,
      error: null,
      lastAnalyzedAt: Date.now()
    })),
    
    on(AiAdvisorActions.analyzeStockFailure, (state, { error }) => ({
      ...state,
      status: 'error' as const,
      error
    })),
    
    on(AiAdvisorActions.resetAnalysis, () => initialState)
  )
});

export const {
  name: aiAdvisorFeatureName,
  reducer: aiAdvisorReducer,
  selectAiAdvisorState,
  selectAnalysis,
  selectSymbol,
  selectStatus,
  selectError,
  selectLastAnalyzedAt
} = aiAdvisorFeature;
