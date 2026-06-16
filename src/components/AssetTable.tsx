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

export function AssetTable({ assets }: Props) {
  const sorted = [...assets].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-base font-semibold text-white">Ativos – Posição Atual</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Ativo</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Tipo</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Valor Atual</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Custo Total</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Retorno Total</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Lucro no Mês</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">% Carteira</th>
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
