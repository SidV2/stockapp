import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StockSignalAdvisorComponent } from './stock-signal-advisor.component';
import { AiStockAnalyzerService } from '../../services/ai-stock-analyzer.service';
import { of } from 'rxjs';
import { StockDetail } from '../../models';

describe('StockSignalAdvisorComponent', () => {
  let component: StockSignalAdvisorComponent;
  let fixture: ComponentFixture<StockSignalAdvisorComponent>;
  let aiService: AiStockAnalyzerService;

  const mockStockDetail: StockDetail = {
    symbol: 'AAPL',
    company: 'Apple Inc.',
    price: 150.00,
    change: 2.50,
    changePercent: 0.0169,
    previousClose: 147.50,
    open: 148.00,
    dayRange: [147.50, 151.00],
    week52Range: [120.00, 180.00],
    marketCap: 2500000000000,
    volume: 50000000,
    avgVolume: 45000000,
    peRatio: 28.5,
    dividendYield: 0.5,
    beta: 1.2,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    summary: 'Leading technology company',
    insights: [],
    news: [],
    history: [145, 146, 147, 148, 150],
    updatedAt: Date.now()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockSignalAdvisorComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StockSignalAdvisorComponent);
    component = fixture.componentInstance;
    component.stockDetail = mockStockDetail;
    aiService = TestBed.inject(AiStockAnalyzerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should analyze stock on init', () => {
    const mockAnalysis = {
      signal: 'BUY' as const,
      confidence: 75,
      reasoning: 'Strong momentum',
      keyFactors: ['Positive trend'],
      timeHorizon: 'short-term' as const,
      riskLevel: 'Medium' as const
    };

    spyOn(aiService, 'analyzeStock').and.returnValue(of(mockAnalysis));
    
    component.ngOnInit();
    
    expect(aiService.analyzeStock).toHaveBeenCalledWith(mockStockDetail);
  });

  it('should set signal class based on analysis', () => {
    component.analysis.set({
      signal: 'BUY',
      confidence: 80,
      reasoning: 'Test',
      keyFactors: [],
      timeHorizon: 'short-term',
      riskLevel: 'Low'
    });

    expect(component.signalClass()).toBe('signal--buy');
  });

  it('should return correct confidence color', () => {
    component.analysis.set({
      signal: 'BUY',
      confidence: 80,
      reasoning: 'Test',
      keyFactors: [],
      timeHorizon: 'short-term',
      riskLevel: 'Low'
    });

    expect(component.confidenceColor()).toBe('confidence--high');
  });

  it('should handle analysis refresh', () => {
    const mockAnalysis = {
      signal: 'HOLD' as const,
      confidence: 60,
      reasoning: 'Mixed signals',
      keyFactors: ['Neutral trend'],
      timeHorizon: 'medium-term' as const,
      riskLevel: 'Medium' as const
    };

    spyOn(aiService, 'analyzeStock').and.returnValue(of(mockAnalysis));
    
    component.analyzeStock();
    
    expect(component.isAnalyzing()).toBe(false);
    expect(component.analysis()).toEqual(mockAnalysis);
  });
});
