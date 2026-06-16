import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { AssetHistory } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils';

const TYPE_BADGE: Record<string, string> = {
  'Variable Income': 'bg-blue-900 text-blue-300',
  'Fixed Income': 'bg-green-900 text-green-300',
  Alternative: 'bg-purple-900 text-purple-300',
  Saving: 'bg-gray-700 text-gray-300',
};

interface Props {
  assets: AssetHistory[];
}

type SortDirection = 'asc' | 'desc';
type SortKey = 'asset' | 'type' | 'value' | 'totalCost' | 'returnRate' | 'monthlyProfitPercentage' | 'portfolioPercentage';

const COLUMN_LABELS: Record<SortKey, string> = {
  asset: 'Ativo',
  type: 'Tipo',
  value: 'Valor Atual',
  totalCost: 'Custo Total',
  returnRate: 'Retorno Total',
  monthlyProfitPercentage: 'Lucro no Mês',
  portfolioPercentage: '% Carteira',
};

export function AssetTable({ assets }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === 'asset' || nextSortKey === 'type' ? 'asc' : 'desc');
  };

  const getSortValue = (asset: AssetHistory, key: SortKey): number | string => {
    switch (key) {
      case 'asset':
        return asset.asset;
      case 'type':
        return asset.type;
      case 'value':
        return asset.value;
      case 'totalCost':
        return asset.averagePrice * asset.quantity;
      case 'returnRate':
        return asset.returnRate;
      case 'monthlyProfitPercentage':
        return asset.monthlyProfitPercentage ?? Number.NEGATIVE_INFINITY;
      case 'portfolioPercentage':
        return asset.portfolioPercentage;
    }
  };

  const sorted = [...assets].sort((leftAsset, rightAsset) => {
    const leftValue = getSortValue(leftAsset, sortKey);
    const rightValue = getSortValue(rightAsset, sortKey);

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      const comparison = leftValue.localeCompare(rightValue, 'pt-BR');
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    const comparison = Number(leftValue) - Number(rightValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const renderHeader = (key: SortKey, align: 'left' | 'right' = 'left') => {
    const isActive = sortKey === key;
    const alignmentClass = align === 'right' ? 'justify-end text-right w-full' : 'justify-start text-left';

    const SortIcon = isActive
      ? sortDirection === 'asc'
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown;

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className={`group flex items-center gap-2 ${alignmentClass} hover:text-white transition-colors`}
      >
        <span>{COLUMN_LABELS[key]}</span>
        <span
          className={`inline-flex items-center justify-center rounded-md border p-1 transition-colors ${
            isActive
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
              : 'border-gray-700 bg-gray-800 text-gray-500 group-hover:border-gray-600 group-hover:text-gray-300'
          }`}
        >
          <SortIcon size={12} />
        </span>
      </button>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-base font-semibold text-white">Ativos – Posição Atual</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('asset')}</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('type')}</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('value', 'right')}</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('totalCost', 'right')}</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('returnRate', 'right')}</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('monthlyProfitPercentage', 'right')}</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">{renderHeader('portfolioPercentage', 'right')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-white">{asset.asset}</div>
                  <div className="text-xs text-gray-500">{asset.subType}</div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      TYPE_BADGE[asset.type] ?? 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {asset.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-medium text-white whitespace-nowrap">
                  {formatCurrency(asset.value)}
                </td>
                <td className="px-5 py-3 text-right text-gray-300 whitespace-nowrap">
                  {formatCurrency(asset.averagePrice * asset.quantity)}
                </td>
                <td
                  className={`px-5 py-3 text-right font-medium whitespace-nowrap ${
                    asset.returnRate >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(asset.returnRate)}
                </td>
                <td
                  className={`px-5 py-3 text-right whitespace-nowrap ${
                    asset.monthlyProfitPercentage == null
                      ? 'text-gray-500'
                      : asset.monthlyProfitPercentage >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                  }`}
                >
                  {asset.monthlyProfitPercentage != null ? formatPercent(asset.monthlyProfitPercentage) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-gray-300 whitespace-nowrap">
                  {formatPercent(asset.portfolioPercentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
