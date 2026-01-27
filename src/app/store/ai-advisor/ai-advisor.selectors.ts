import { createSelector } from '@ngrx/store';
import { aiAdvisorFeature } from './ai-advisor.reducer';

const selectAiAnalysis = aiAdvisorFeature.selectAnalysis;
const selectAiSymbol = aiAdvisorFeature.selectSymbol;
const selectAiStatus = aiAdvisorFeature.selectStatus;
const selectAiError = aiAdvisorFeature.selectError;
const selectLastAnalyzedAt = aiAdvisorFeature.selectLastAnalyzedAt;

const selectIsAiAnalyzing = createSelector(
  selectAiStatus,
  (status) => status === 'loading'
);

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
