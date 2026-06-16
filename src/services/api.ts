import type { AssetHistory } from '../types';

export async function fetchAssetHistory(): Promise<AssetHistory[]> {
  const response = await fetch('/api/asset/history-performance');
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<AssetHistory[]>;
}
