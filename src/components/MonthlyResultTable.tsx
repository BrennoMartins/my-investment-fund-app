import { MONTHLY_RESULTM } from '../config/monthly-resultm';
import { formatCurrencyWithDecimals, formatDateLabel, formatPercent } from '../lib/utils';

export function MonthlyResultTable() {
  const rows = [...MONTHLY_RESULTM].sort((a, b) => b.month.localeCompare(a.month));
  const totalMonthlyProfit = rows.reduce((sum, entry) => sum + entry.monthlyProfit, 0);
  const totalGrowthPercentage = rows.reduce((sum, entry) => sum + entry.growthPercentage, 0);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-base font-semibold text-white">Resultado Mensal</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Mês</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Lucro no Mês</th>
              <th className="text-right px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Crescimento Mensal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => (
              <tr
                key={entry.month}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-white whitespace-nowrap">
                  {formatDateLabel(entry.month)}
                </td>
                <td
                  className={`px-5 py-3 text-right font-medium whitespace-nowrap ${
                    entry.monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatCurrencyWithDecimals(entry.monthlyProfit, 0)}
                </td>
                <td
                  className={`px-5 py-3 text-right font-medium whitespace-nowrap ${
                    entry.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatPercent(entry.growthPercentage)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-600 bg-gray-700/40">
              <td className="px-5 py-3 font-semibold text-white whitespace-nowrap">Total</td>
              <td
                className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${
                  totalMonthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrencyWithDecimals(totalMonthlyProfit, 0)}
              </td>
              <td
                className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${
                  totalGrowthPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatPercent(totalGrowthPercentage)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}