import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AssetHistory } from '../types';
import { getTotalValueByDate, formatCurrencyWithDecimals, formatDateLabel } from '../lib/utils';

interface Props {
  data: AssetHistory[];
}

interface ChartPoint {
  date: string;
  label: string;
  total: number;
  actualTotal: number | null;
  projectedTotal: number | null;
  projected: boolean;
}

function addMonths(date: string, monthsToAdd: number): string {
  const [year, month] = date.split('-').map(Number);
  const nextDate = new Date(year ?? 0, (month ?? 1) - 1 + monthsToAdd, 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}-01`;
}

function buildChartData(data: AssetHistory[]): ChartPoint[] {
  const historicalData = getTotalValueByDate(data);
  if (historicalData.length === 0) {
    return [];
  }

  const historicalPoints: ChartPoint[] = historicalData.map((entry) => ({
    ...entry,
    actualTotal: entry.total,
    projectedTotal: null,
    projected: false,
  }));

  if (historicalData.length < 2) {
    return historicalPoints;
  }

  const deltas = historicalData
    .slice(1)
    .map((entry, index) => entry.total - historicalData[index].total);
  const averageDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;

  const lastHistoricalPoint = historicalPoints[historicalPoints.length - 1];
  if (lastHistoricalPoint == null) {
    return historicalPoints;
  }

  const lastMonth = Number(lastHistoricalPoint.date.split('-')[1] ?? '12');
  if (lastMonth >= 12) {
    return historicalPoints;
  }

  lastHistoricalPoint.projectedTotal = lastHistoricalPoint.total;

  let currentTotal = lastHistoricalPoint.total;
  const projectedPoints: ChartPoint[] = [];

  for (let monthOffset = 1; monthOffset <= 12 - lastMonth; monthOffset += 1) {
    const nextDate = addMonths(lastHistoricalPoint.date, monthOffset);
    currentTotal += averageDelta;
    projectedPoints.push({
      date: nextDate,
      label: formatDateLabel(nextDate),
      total: currentTotal,
      actualTotal: null,
      projectedTotal: currentTotal,
      projected: true,
    });
  }

  return [...historicalPoints, ...projectedPoints];
}

export function PortfolioEvolutionChart({ data }: Props) {
  const chartData = buildChartData(data);

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Evolução do Patrimônio</h2>
        <p className="text-xs text-gray-500 mt-0.5">Meses futuros projetados com base na variação média observada</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `R$ ${(Number(value) / 1000).toFixed(0)}k`}
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
            formatter={(value, name, item) => [
              formatCurrencyWithDecimals(Number(value), 0),
              item.payload.projected || name === 'projectedTotal' ? 'Patrimônio projetado' : 'Patrimônio',
            ]}
          />
          <Area
            type="monotone"
            dataKey="actualTotal"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorTotal)"
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="projectedTotal"
            stroke="#93c5fd"
            strokeWidth={2}
            strokeDasharray="6 6"
            fill="none"
            dot={{ fill: '#93c5fd', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
