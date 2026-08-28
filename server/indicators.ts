/**
 * Technical Indicators Engine for Nifty 50 Market Breadth Platform
 * Implements standard quantitative formulas (EMA, RSI-14, MACD, Golden Stack, Breakouts)
 */

export function calculateEMA(prices: number[], period: number): number[] {
  if (!prices || prices.length < period) return new Array(prices?.length || 0).fill(0);

  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(prices.length).fill(0);

  // Initial SMA as starting seed
  let initialSma = 0;
  for (let i = 0; i < period; i++) {
    initialSma += prices[i];
  }
  initialSma /= period;
  emaArray[period - 1] = initialSma;

  // Compute Recursive EMA
  for (let i = period; i < prices.length; i++) {
    emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
  }

  // Backfill pre-period indices for smooth charting
  for (let i = 0; i < period - 1; i++) {
    emaArray[i] = initialSma;
  }

  return emaArray;
}

export function calculateRSI(prices: number[], period = 14): number[] {
  if (!prices || prices.length < period + 1) return new Array(prices?.length || 0).fill(50);

  const rsiArray: number[] = new Array(prices.length).fill(50);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff >= 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // Initial Average Gain / Loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiArray[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + firstRS));

  // Smoothed Wilder's Moving Average
  for (let i = period + 1; i < prices.length; i++) {
    const currentGain = gains[i - 1];
    const currentLoss = losses[i - 1];

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsiArray[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsiArray[i] = Number((100 - (100 / (1 + rs))).toFixed(2));
    }
  }

  return rsiArray;
}

export interface MacdResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdResult {
  const len = prices?.length || 0;
  if (len < slowPeriod) {
    return {
      macdLine: new Array(len).fill(0),
      signalLine: new Array(len).fill(0),
      histogram: new Array(len).fill(0),
    };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = new Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    macdLine[i] = Number((fastEMA[i] - slowEMA[i]).toFixed(2));
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = new Array(len).fill(0);

  for (let i = 0; i < len; i++) {
    histogram[i] = Number((macdLine[i] - signalLine[i]).toFixed(2));
  }

  return {
    macdLine,
    signalLine,
    histogram,
  };
}
