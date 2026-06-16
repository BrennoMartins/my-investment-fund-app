import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { DIVIDENDS } from '../config/dividends';
import { formatCurrency, formatDateLabel } from '../lib/utils';

export function DividendChart() {
  const total = DIVIDENDS.reduce((sum, d) => sum + d.amount, 0);
  const avg = total / DIVIDENDS.length;

  const chartData = DIVIDENDS.map((d) => ({
    label: formatDateLabel(d.date),
    amount: d.amount,
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Proventos Recebidos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Reinvestidos mensalmente</p>
        </div>
        <div className="flex gap-6 text-right shrink-0">
          <div>
            <p className="text-xs text-gray-400">Total acumulado</p>
            <p className="text-sm font-bold text-green-400">{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Média mensal</p>
            <p className="text-sm font-bold text-blue-400">{formatCurrency(avg)}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 16, left: 8, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `R$ ${Number(v).toFixed(0)}`}
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
            formatter={(value) => [formatCurrency(Number(value)), 'Proventos']}
          />
          <ReferenceLine
            y={avg}
            stroke="#3b82f6"
            strokeDasharray="4 4"
            label={{ value: 'Média', fill: '#3b82f6', fontSize: 11, position: 'insideTopRight' }}
          />
          <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="amount"
              position="top"
              formatter={(v: number) => formatCurrency(v)}
              style={{ fill: '#d1fae5', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
