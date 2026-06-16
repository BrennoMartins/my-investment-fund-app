import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { AssetHistory } from '../types';
import { getUniqueDates, getAssetsForDate, formatCurrency, formatDateLabel } from '../lib/utils';

interface Props {
  data: AssetHistory[];
}

export function MonthlyProfitChart({ data }: Props) {
  const dates = getUniqueDates(data);
  const chartData = dates.map((date) => {
    const assets = getAssetsForDate(data, date);
    const totalProfit = assets.reduce((sum, a) => sum + (a.profit ?? 0), 0);
    return { label: formatDateLabel(date), profit: totalProfit };
  });

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h2 className="text-base font-semibold text-white mb-4">Lucro Mensal Total</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `R$ ${(Number(value) / 1000).toFixed(1)}k`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value) => [formatCurrency(Number(value)), 'Lucro']}
          />
          <ReferenceLine y={0} stroke="#4b5563" />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.profit >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
