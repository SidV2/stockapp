import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAiAnalyzing } from '../store/ai-advisor/ai-advisor.selectors';

export interface CanDeactivateComponent {
  canDeactivate(): boolean;
}

export const stockDetailCanDeactivate: CanDeactivateFn<CanDeactivateComponent> = (component) => {
  const isAnalyzing = inject(Store).selectSignal(selectIsAiAnalyzing)();

  if (isAnalyzing) {
    return confirm('AI analysis is in progress. Leave and cancel?');
  }

  return component.canDeactivate();
};
