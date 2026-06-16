import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ActiveFilter, AssetHistory } from '../types';
import { getAllocationByType, formatCurrency, formatPercent } from '../lib/utils';

const renderLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {formatPercent(percent, 0)}
    </text>
  );
};

const TYPE_COLORS: Record<string, string> = {
  'Variable Income': '#3b82f6',
  'Fixed Income': '#10b981',
  Alternative: '#a855f7',
  Saving: '#6b7280',
};

const FALLBACK_COLOR = '#f59e0b';
const FILTER_FIELD = 'type' as const;

interface Props {
  assets: AssetHistory[];
  activeFilter: ActiveFilter;
  onFilterChange: (f: ActiveFilter) => void;
}

export function AllocationPieChart({ assets, activeFilter, onFilterChange }: Props) {
  const data = getAllocationByType(assets);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isFiltering = activeFilter?.field === FILTER_FIELD;

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h2 className="text-base font-semibold text-white mb-1">Alocação por Tipo</h2>
      <p className="text-xs text-gray-500 mb-3">Clique numa fatia para filtrar</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            cursor="pointer"
          >
            {data.map((entry) => {
              const isSelected = activeFilter?.value === entry.name;
              return (
                <Cell
                  key={entry.name}
                  fill={TYPE_COLORS[entry.name] ?? FALLBACK_COLOR}
                  opacity={isFiltering && !isSelected ? 0.3 : 1}
                  stroke={isFiltering && isSelected ? '#fff' : 'none'}
                  strokeWidth={isFiltering && isSelected ? 2 : 0}
                  onClick={() =>
                    onFilterChange(
                      isFiltering && isSelected
                        ? null
                        : { field: FILTER_FIELD, value: entry.name },
                    )
                  }
                />
              );
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 8,
            }}
            formatter={(value, name) => [
              `${formatCurrency(Number(value))} (${formatPercent(Number(value) / total)})`,
              String(name),
            ]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#d1d5db', fontSize: 12 }}>{String(value)}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
