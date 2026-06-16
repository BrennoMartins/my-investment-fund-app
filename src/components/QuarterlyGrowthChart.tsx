import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps as RechartsTooltipProps } from 'recharts';
import { MONTHLY_RESULTM } from '../config/monthly-resultm';
import { formatCurrencyWithDecimals, formatPercent } from '../lib/utils';

function getQuarterLabel(month: string): string {
  const [year, monthValue] = month.split('-');
  const quarter = Math.floor((Number(monthValue) - 1) / 3) + 1;
  return `T${quarter}/${year}`;
}

export function QuarterlyGrowthChart() {
  const quarterMap = new Map<string, { label: string; growth: number; monthlyProfit: number }>();

  for (const entry of MONTHLY_RESULTM) {
    const label = getQuarterLabel(entry.month);
    const current = quarterMap.get(label);

    if (current == null) {
      quarterMap.set(label, {
        label,
        growth: entry.growthPercentage,
        monthlyProfit: entry.monthlyProfit,
      });
      continue;
    }

    current.growth += entry.growthPercentage;
    current.monthlyProfit += entry.monthlyProfit;
  }

  const chartData = Array.from(quarterMap.values());

  const renderTooltip = ({ active, payload, label }: RechartsTooltipProps<ValueType, NameType>) => {
    if (!active || payload == null || payload.length === 0) {
      return null;
    }

    const data = payload[0];
    const monthlyProfit = data?.payload?.monthlyProfit;
    if (data == null || typeof data.value !== 'number' || typeof monthlyProfit !== 'number') {
      return null;
    }

    return (
      <div
        style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: 8,
          padding: 12,
        }}
      >
        <p style={{ color: '#f9fafb', fontSize: 12, fontWeight: 600 }}>{label}</p>
        <p style={{ color: '#d1d5db', fontSize: 12 }}>
          Crescimento: {formatPercent(data.value)}
        </p>
        <p style={{ color: '#d1d5db', fontSize: 12 }}>
          Lucro acumulado: {formatCurrencyWithDecimals(monthlyProfit, 0)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Crescimento por Trimestre</h2>
        <p className="text-xs text-gray-500 mt-0.5">Soma do crescimento mensal em cada trimestre</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatPercent(Number(value), 0)}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            content={renderTooltip}
          />
          <ReferenceLine y={0} stroke="#4b5563" />
          <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.label}
                fill={entry.growth >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}