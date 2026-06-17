import type { StockEntry } from '../types';
import raw from './stock.csv?raw';

function parseStockCSV(csv: string): StockEntry[] {
  const lines = csv.trim().split('\n');
  const dataLines = lines.slice(1); // skip header

  return dataLines
    .map((line) => {
      const parts = line.trim().split(';');
      if (parts.length < 13) return null;
      const [date, ticker, quote, quantity, totalValue, avgPrice, totalCost, targetPct, currentPct, diffPct, fixUnits, profitPct, profitValue] = parts;
      return {
        date: date ?? '',
        ticker: ticker ?? '',
        quote: parseFloat(quote ?? '0'),
        quantity: parseInt(quantity ?? '0', 10),
        totalValue: parseFloat(totalValue ?? '0'),
        avgPrice: parseFloat(avgPrice ?? '0'),
        totalCost: parseFloat(totalCost ?? '0'),
        targetPct: parseFloat(targetPct ?? '0'),
        currentPct: parseFloat(currentPct ?? '0'),
        diffPct: parseFloat(diffPct ?? '0'),
        fixUnits: parseInt(fixUnits ?? '0', 10),
        profitPct: parseFloat(profitPct ?? '0'),
        profitValue: parseFloat(profitValue ?? '0'),
      } satisfies StockEntry;
    })
    .filter((e): e is StockEntry => e !== null);
}

export const STOCK_DATA: StockEntry[] = parseStockCSV(raw);

/** Returns the list of unique dates, sorted ascending */
export function getStockDates(): string[] {
  return [...new Set(STOCK_DATA.map((e) => e.date))].sort();
}

/** Returns entries for a specific date */
export function getStockEntriesForDate(date: string): StockEntry[] {
  return STOCK_DATA.filter((e) => e.date === date);
}

/** Returns the latest available date */
export function getLatestStockDate(): string {
  const dates = getStockDates();
  return dates[dates.length - 1] ?? '';
}

/** Classify asset into category */
export function getAssetCategory(ticker: string): 'FII' | 'ETF' | 'Ação' {
  const etfs = ['BOVA11', 'SMAL11'];
  const acoes11 = ['BPAC11'];
  if (etfs.includes(ticker)) return 'ETF';
  if (acoes11.includes(ticker)) return 'Ação';
  if (ticker.endsWith('11')) return 'FII';
  return 'Ação';
}
