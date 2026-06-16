import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ActiveFilter, AssetHistory } from '../types';
import { formatCurrencyWithDecimals, formatPercent } from '../lib/utils';

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

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#a855f7', '#f59e0b',
  '#ef4444', '#06b6d4', '#84cc16', '#ec4899',
];
const FILTER_FIELD = 'category' as const;

interface Props {
  assets: AssetHistory[];
  activeFilter: ActiveFilter;
  onFilterChange: (f: ActiveFilter) => void;
}

export function CategoryAllocationChart({ assets, activeFilter, onFilterChange }: Props) {
  const map = new Map<string, number>();
  for (const asset of assets) {
    map.set(asset.category, (map.get(asset.category) ?? 0) + asset.value);
  }
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  const data = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const isFiltering = activeFilter?.field === FILTER_FIELD;

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h2 className="text-base font-semibold text-white mb-1">Alocação por Categoria</h2>
      <p className="text-xs text-gray-500 mb-3">Clique numa fatia para filtrar</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            cursor="pointer"
          >
            {data.map((entry, index) => {
              const isSelected = activeFilter?.value === entry.name;
              return (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
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
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
            formatter={(value, name) => [
              `${formatCurrencyWithDecimals(Number(value), 0)} (${formatPercent(Number(value) / total, 0)})`,
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
