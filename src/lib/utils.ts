import type { AssetHistory } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyWithDecimals(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDateLabel(date: string): string {
  const parts = date.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const year = parts[0] ?? '';
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[month - 1]}/${year}`;
}

export function getLatestDate(data: AssetHistory[]): string {
  const dates = [...new Set(data.map((d) => d.date))].sort();
  return dates[dates.length - 1] ?? '';
}

export function getUniqueDates(data: AssetHistory[]): string[] {
  return [...new Set(data.map((d) => d.date))].sort();
}

export function getAssetsForDate(data: AssetHistory[], date: string): AssetHistory[] {
  return data.filter((d) => d.date === date);
}

export function getTotalValueByDate(
  data: AssetHistory[],
): { date: string; label: string; total: number }[] {
  const dates = getUniqueDates(data);
  return dates.map((date) => ({
    date,
    label: formatDateLabel(date),
    total: getAssetsForDate(data, date).reduce((sum, a) => sum + a.value, 0),
  }));
}

export function getAllocationByType(
  assets: AssetHistory[],
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const asset of assets) {
    map.set(asset.type, (map.get(asset.type) ?? 0) + asset.value);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
