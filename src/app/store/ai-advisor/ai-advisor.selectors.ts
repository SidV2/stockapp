import { createSelector } from '@ngrx/store';
import { aiAdvisorFeature } from './ai-advisor.reducer';

// Re-export feature selectors
export const selectAiAnalysis = aiAdvisorFeature.selectAnalysis;
export const selectAiSymbol = aiAdvisorFeature.selectSymbol;
export const selectAiStatus = aiAdvisorFeature.selectStatus;
export const selectAiError = aiAdvisorFeature.selectError;
export const selectLastAnalyzedAt = aiAdvisorFeature.selectLastAnalyzedAt;

// Computed selectors
export const selectIsAiAnalyzing = createSelector(
  selectAiStatus,
  (status) => status === 'loading'
);

export const selectIsAiAnalysisLoaded = createSelector(
  selectAiStatus,
  (status) => status === 'success'
);

export const selectHasAiError = createSelector(
  selectAiStatus,
  (status) => status === 'error'
);

// Check if analysis is stale (older than 5 minutes)
export const selectIsAnalysisStale = createSelector(
  selectLastAnalyzedAt,
  (lastAnalyzedAt) => {
    if (!lastAnalyzedAt) return true;
    const FIVE_MINUTES = 5 * 60 * 1000;
    return Date.now() - lastAnalyzedAt > FIVE_MINUTES;
  }
);

// Combined selector for component convenience
export const selectAiAdvisorViewModel = createSelector(
  selectAiAnalysis,
  selectAiSymbol,
  selectIsAiAnalyzing,
  selectAiError,
  selectLastAnalyzedAt,
  (analysis, symbol, isAnalyzing, error, lastAnalyzedAt) => ({
    analysis,
    symbol,
    isAnalyzing,
    error,
    lastAnalyzedAt
  })
);
