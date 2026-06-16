import type { AssetHistory } from '../types';
import { ASSET_HISTORY_MOCK } from '../config/asset-history';

const USE_MOCK_ASSET_HISTORY = import.meta.env.VITE_USE_MOCK_ASSET_HISTORY !== 'false';

export async function fetchAssetHistory(): Promise<AssetHistory[]> {
  if (USE_MOCK_ASSET_HISTORY) {
    return ASSET_HISTORY_MOCK;
  }

  const response = await fetch('/api/asset/history-performance');
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<AssetHistory[]>;
}
