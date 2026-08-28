export interface EmaStatus {
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  isAboveEma9: boolean;
  isAboveEma20: boolean;
  isAboveEma50: boolean;
  isAboveEma100: boolean;
  isAboveEma200: boolean;
  diffEma9Percent: number;
  diffEma20Percent: number;
  diffEma50Percent: number;
  diffEma100Percent: number;
  diffEma200Percent: number;
}

export interface RsiStatus {
  rsi14: number;
  isAbove50: boolean;
  isOverbought: boolean; // RSI > 70
  isOversold: boolean;   // RSI < 30
}

export interface MacdStatus {
  macdLine: number;
  signalLine: number;
  histogram: number;
  isBullish: boolean; // MACD > Signal Line
}

export interface StockBreadthItem {
  symbol: string;
  ticker: string; // e.g. RELIANCE.NS
  name: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  week52High: number;
  week52Low: number;
  distFrom52WHighPercent: number;
  emas: EmaStatus;
  rsi: RsiStatus;
  macd: MacdStatus;
  bullishScore: number; // 0 to 5 (how many EMAs 9,20,50,100,200 it is above)
  isGoldenStack: boolean; // Price > 9 > 20 > 50 > 100 > 200
  isDeathStack: boolean;  // Price < 9 < 20 < 50 < 100 < 200
  isGoldenCross: boolean; // 50 EMA > 200 EMA
  isNear20DHigh: boolean;
  history?: {
    date: string;
    close: number;
    high?: number;
    low?: number;
    ema9?: number;
    ema20?: number;
    ema50?: number;
    ema100?: number;
    ema200?: number;
    rsi14?: number;
    macdLine?: number;
    signalLine?: number;
    histogram?: number;
  }[];
}

export interface BreadthMetric {
  count: number;
  total: number;
  percentage: number;
  bullishSymbols: string[];
  bearishSymbols: string[];
}

export interface SectorBreadth {
  sector: string;
  totalStocks: number;
  aboveEma9: number;
  aboveEma20: number;
  aboveEma50: number;
  aboveEma100: number;
  aboveEma200: number;
  rsiAbove50Count: number;
  macdBullishCount: number;
  aboveEma9Percent: number;
  aboveEma20Percent: number;
  aboveEma50Percent: number;
  aboveEma100Percent: number;
  aboveEma200Percent: number;
  rsiAbove50Percent: number;
  macdBullishPercent: number;
  avgChangePercent: number;
}

export interface TimeSeriesBreadthPoint {
  date: string;
  aboveEma9Percent: number;
  aboveEma20Percent: number;
  aboveEma50Percent: number;
  aboveEma100Percent: number;
  aboveEma200Percent: number;
  rsiAbove50Percent: number;
  niftyPrice?: number;
  indexPrice?: number;
}

export interface AdvanceDeclineStatus {
  advances: number;
  declines: number;
  unchanged: number;
  ratio: number; // e.g. 1.85
  ratioFormatted: string; // e.g. "1.85:1"
  sentiment: 'Strong Advances' | 'Mild Advances' | 'Neutral' | 'Mild Declines' | 'Strong Declines';
}

export interface RelativeStrengthStatus {
  score: number; // 0 - 100
  benchmarkDiffPercent: number; // vs Nifty 50 over 1M/3M
  status: 'Strong Outperformer' | 'Moderate Outperformer' | 'In-Line' | 'Underperformer' | 'Severe Laggard';
  outperforming: boolean;
  benchmarkName: string;
}

export interface MarketBreadthResponse {
  indexId?: string;
  indexName?: string;
  indexCategory?: string;
  indexInfo: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    timestamp: string;
  };
  advanceDecline: AdvanceDeclineStatus;
  relativeStrength: RelativeStrengthStatus;
  summary: {
    totalStocks: number;
    aboveEma9: BreadthMetric;
    aboveEma20: BreadthMetric;
    aboveEma50: BreadthMetric;
    aboveEma100: BreadthMetric;
    aboveEma200: BreadthMetric;
    rsiAbove50: BreadthMetric;
    macdBullish: BreadthMetric;
    goldenCrossCount: number;
    aboveAllEmasCount: number; // 5/5
    belowAllEmasCount: number; // 0/5
    goldenStackCount: number;
    marketStance: 'Strong Bullish' | 'Mild Bullish' | 'Neutral' | 'Mild Bearish' | 'Strong Bearish';
    marketStanceReason: string;
  };
  sectorBreadth: SectorBreadth[];
  timeSeriesBreadth: TimeSeriesBreadthPoint[];
  stocks: StockBreadthItem[];
  lastUpdated: string;
  cached: boolean;
}

export interface IndexTickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
}

export interface MarketTickerResponse {
  nifty: IndexTickerItem;
  sensex: IndexTickerItem;
  bankNifty: IndexTickerItem;
  indiaVix: IndexTickerItem;
  tickersList?: IndexTickerItem[];
  isMarketOpen: boolean;
  marketStatusText: string;
  timestamp: string;
}

export type RRGQuadrant = 'Leading' | 'Weakening' | 'Lagging' | 'Improving';

export interface RRGDataPoint {
  date: string;
  rsRatio: number; // Centered at 100
  rsMomentum: number; // Centered at 100
  rawRelativeStrength?: number;
  quadrant: RRGQuadrant;
  distanceFromBenchmark: number;
  headingAngle: number; // Degrees 0 - 360
}

export interface RRGSectorItem {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  category: string;
  color: string;
  accentHex: string;
  currentRsRatio: number;
  currentRsMomentum: number;
  previousRsRatio: number;
  previousRsMomentum: number;
  ratioChange: number;
  momentumChange: number;
  quadrant: RRGQuadrant;
  previousQuadrant: RRGQuadrant;
  distanceFromBenchmark: number;
  headingAngle: number;
  trail: RRGDataPoint[];
  latestClose: number;
  benchmarkClose: number;
}

export interface RRGResponse {
  benchmark: {
    id: string;
    name: string;
    ticker: string;
    currentPrice: number;
    changePercent: number;
  };
  timeframe: 'daily' | 'weekly';
  trailLength: number;
  sectors: RRGSectorItem[];
  quadrantCounts: {
    leading: number;
    weakening: number;
    lagging: number;
    improving: number;
  };
  lastUpdated: string;
}
