import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

type SearchSuggestion = {
  symbol: string;
  name: string;
};

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPanelComponent implements OnDestroy {
  readonly suggestions: SearchSuggestion[] = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
  ];

  readonly searchForm = this.fb.nonNullable.group({
    query: ['']
  });

  readonly queryControl = this.searchForm.controls.query;
  filteredSuggestions: SearchSuggestion[] = this.suggestions;
  isDropdownOpen = false;
  private dropdownTimeout?: ReturnType<typeof setTimeout>;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder) {
    this.queryControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.filteredSuggestions = this.filterSuggestions(value);
      this.isDropdownOpen = this.filteredSuggestions.length > 0 && value.trim().length > 0;
    });
  }

  onFocus(): void {
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
    }
    if (this.queryControl.value.trim()) {
      this.isDropdownOpen = this.filteredSuggestions.length > 0;
    }
  }

  onBlur(): void {
    this.dropdownTimeout = setTimeout(() => {
      this.isDropdownOpen = false;
    }, 120);
  }

  selectSuggestion(symbol: string): void {
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
    }
    this.queryControl.setValue(symbol, { emitEvent: false });
    this.filteredSuggestions = this.filterSuggestions(symbol);
    this.isDropdownOpen = false;
  }

  ngOnDestroy(): void {
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterSuggestions(value: string): SearchSuggestion[] {
    const term = value.trim().toLowerCase();
    if (!term) return this.suggestions;
    return this.suggestions.filter(
      suggestion =>
        suggestion.symbol.toLowerCase().includes(term) || suggestion.name.toLowerCase().includes(term)
    );
  }
}
