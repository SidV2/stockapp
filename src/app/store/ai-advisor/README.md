# AI Advisor NgRx Store

This store manages the state for AI-powered stock analysis using NgRx effects.

## 📋 Architecture

```
Component
    ↓ dispatches action
AiAdvisorActions.analyzeStock({ stockDetail })
    ↓ triggers
AiAdvisorEffects.analyzeStock$
    ↓ calls
AiStockAnalyzerService.analyzeStock()
    ↓ returns
StockAnalysis
    ↓ dispatches
AiAdvisorActions.analyzeStockSuccess({ analysis })
    ↓ updates
AiAdvisorReducer (state)
    ↓ selectors
Component (via signals)
```

## 🎯 Usage in Components

### Basic Usage:

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AiAdvisorActions } from './store/ai-advisor/ai-advisor.actions';
import { selectAiAdvisorViewModel } from './store/ai-advisor/ai-advisor.selectors';

@Component({
  // ...
})
export class MyComponent implements OnInit {
  // Subscribe to the view model
  private readonly viewModel = toSignal(
    this.store.select(selectAiAdvisorViewModel)
  );

  // Access individual properties
  readonly analysis = computed(() => this.viewModel()?.analysis);
  readonly isAnalyzing = computed(() => this.viewModel()?.isAnalyzing);
  readonly error = computed(() => this.viewModel()?.error);

  constructor(private store: Store) {}

  ngOnInit() {
    // Trigger analysis
    this.analyzeStock();
  }

  analyzeStock() {
    this.store.dispatch(AiAdvisorActions.analyzeStock({ 
      stockDetail: this.myStockData 
    }));
  }
}
```

### In Templates:

```html
@if (isAnalyzing()) {
  <div>Analyzing with AI...</div>
}

@if (error(); as errorMsg) {
  <div class="error">{{ errorMsg }}</div>
}

@if (analysis(); as result) {
  <div>
    <h3>{{ result.signal }}</h3>
    <p>Confidence: {{ result.confidence }}%</p>
    <p>{{ result.reasoning }}</p>
  </div>
}
```

## 🔄 Actions

### `analyzeStock`
Triggers AI analysis for a stock.

```typescript
this.store.dispatch(AiAdvisorActions.analyzeStock({ 
  stockDetail: stockData 
}));
```

### `analyzeStockSuccess`
Dispatched by effect when analysis succeeds.

```typescript
// Dispatched automatically by effect
AiAdvisorActions.analyzeStockSuccess({ 
  analysis: result, 
  symbol: 'AAPL' 
});
```

### `analyzeStockFailure`
Dispatched by effect when analysis fails.

```typescript
// Dispatched automatically by effect
AiAdvisorActions.analyzeStockFailure({ 
  error: 'Network error' 
});
```

### `resetAnalysis`
Clears the analysis state.

```typescript
this.store.dispatch(AiAdvisorActions.resetAnalysis());
```

## 📊 Selectors

### Basic Selectors:

```typescript
// Get the full analysis object
selectAiAnalysis

// Get the stock symbol being analyzed
selectAiSymbol

// Get current status
selectAiStatus // 'idle' | 'loading' | 'success' | 'error'

// Get error message
selectAiError

// Get timestamp of last analysis
selectLastAnalyzedAt
```

### Computed Selectors:

```typescript
// Check if currently analyzing
selectIsAiAnalyzing

// Check if analysis is loaded
selectIsAiAnalysisLoaded

// Check if there's an error
selectHasAiError

// Check if analysis is stale (>5 minutes old)
selectIsAnalysisStale

// Get complete view model (recommended)
selectAiAdvisorViewModel
```

### Usage Examples:

```typescript
// Individual selectors
readonly isAnalyzing = toSignal(
  this.store.select(selectIsAiAnalyzing),
  { initialValue: false }
);

readonly analysis = toSignal(
  this.store.select(selectAiAnalysis)
);

// View model (combines multiple selectors)
readonly viewModel = toSignal(
  this.store.select(selectAiAdvisorViewModel)
);
```

## 🔄 Effects

### `analyzeStock$`

Handles the AI analysis API call.

**Flow:**
1. Listens for `analyzeStock` action
2. Logs start of analysis
3. Calls `AiStockAnalyzerService.analyzeStock()`
4. On success: Dispatches `analyzeStockSuccess`
5. On error: Dispatches `analyzeStockFailure` (with fallback)

**Features:**
- ✅ Automatic error handling
- ✅ Fallback to heuristic analysis on API failure
- ✅ Console logging for debugging
- ✅ Symbol tracking in success action

## 🎭 State Shape

```typescript
interface AiAdvisorState {
  analysis: StockAnalysis | null;  // The AI analysis result
  symbol: string | null;            // Stock symbol being analyzed
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;             // Error message if failed
  lastAnalyzedAt: number | null;    // Timestamp of last analysis
}
```

### Initial State:

```typescript
{
  analysis: null,
  symbol: null,
  status: 'idle',
  error: null,
  lastAnalyzedAt: null
}
```

## 🎯 State Transitions

```
IDLE → (analyzeStock) → LOADING
LOADING → (analyzeStockSuccess) → SUCCESS
LOADING → (analyzeStockFailure) → ERROR
ANY → (resetAnalysis) → IDLE
```

## 🧪 Testing

### Testing the Effect:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { AiAdvisorEffects } from './ai-advisor.effects';

describe('AiAdvisorEffects', () => {
  let actions$: Observable<any>;
  let effects: AiAdvisorEffects;
  let aiService: jasmine.SpyObj<AiStockAnalyzerService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AiStockAnalyzerService', ['analyzeStock']);
    
    TestBed.configureTestingModule({
      providers: [
        AiAdvisorEffects,
        provideMockActions(() => actions$),
        { provide: AiStockAnalyzerService, useValue: spy }
      ]
    });

    effects = TestBed.inject(AiAdvisorEffects);
    aiService = TestBed.inject(AiStockAnalyzerService) as jasmine.SpyObj<AiStockAnalyzerService>;
  });

  it('should dispatch success on successful analysis', (done) => {
    const mockAnalysis = { signal: 'BUY', confidence: 80 };
    aiService.analyzeStock.and.returnValue(of(mockAnalysis));
    
    actions$ = of(AiAdvisorActions.analyzeStock({ stockDetail: mockStock }));
    
    effects.analyzeStock$.subscribe(action => {
      expect(action.type).toBe('[AI Advisor] Analyze Stock Success');
      done();
    });
  });
});
```

## 📈 DevTools Integration

The AI Advisor store integrates with Redux DevTools:

**View state:**
```javascript
// In Redux DevTools
state.aiAdvisor
```

**Track actions:**
```
[AI Advisor] Analyze Stock
[AI Advisor] Analyze Stock Success
[AI Advisor] Analyze Stock Failure
[AI Advisor] Reset Analysis
```

## 🎨 Best Practices

### 1. Use View Model Selector

**Good:**
```typescript
readonly viewModel = toSignal(
  this.store.select(selectAiAdvisorViewModel)
);
```

**Avoid:**
```typescript
// Don't subscribe to multiple selectors separately
readonly analysis = toSignal(this.store.select(selectAiAnalysis));
readonly isAnalyzing = toSignal(this.store.select(selectIsAiAnalyzing));
readonly error = toSignal(this.store.select(selectAiError));
// ... etc
```

### 2. Reset on Destroy

```typescript
ngOnDestroy() {
  this.store.dispatch(AiAdvisorActions.resetAnalysis());
}
```

### 3. Check for Stale Data

```typescript
const isStale = this.store.select(selectIsAnalysisStale);

if (isStale) {
  this.analyzeStock(); // Refresh if needed
}
```

### 4. Handle Loading States

```html
@if (isAnalyzing()) {
  <app-shimmer-ui />
}

@if (!isAnalyzing() && analysis()) {
  <app-analysis-display [data]="analysis()" />
}
```

## 🔍 Debugging

### Enable Effect Logging:

The effect already includes console logs:
```
🤖 Effect: Starting AI analysis for AAPL
✅ Effect: Analysis completed for AAPL
❌ Effect: Analysis failed
```

### Check Redux DevTools:

1. Open browser DevTools
2. Go to Redux tab
3. Watch for actions:
   - `[AI Advisor] Analyze Stock`
   - `[AI Advisor] Analyze Stock Success`

### Inspect State:

```typescript
this.store.select(selectAiAdvisorState).subscribe(state => {
  console.log('AI Advisor State:', state);
});
```

## 🚀 Performance

### Automatic Optimizations:

- ✅ `switchMap` cancels previous requests if new one starts
- ✅ Signals for reactive updates
- ✅ `OnPush` change detection compatible
- ✅ Memoized selectors

### Caching:

Consider adding caching in the service layer:

```typescript
private cache = new Map<string, { analysis: StockAnalysis, timestamp: number }>();

analyzeStock(stock: StockDetail) {
  const key = `${stock.symbol}-${stock.updatedAt}`;
  const cached = this.cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return of(cached.analysis);
  }
  
  return this.apiCall(stock).pipe(
    tap(analysis => this.cache.set(key, { analysis, timestamp: Date.now() }))
  );
}
```

## 📚 Related Files

- **Actions**: `ai-advisor.actions.ts`
- **Effects**: `ai-advisor.effects.ts`
- **Reducer**: `ai-advisor.reducer.ts`
- **Selectors**: `ai-advisor.selectors.ts`
- **Service**: `../services/ai-stock-analyzer.service.ts`
- **Component**: `../components/stock-signal-advisor/stock-signal-advisor.component.ts`

---

**Questions?** Check the main component implementation for a complete working example!
