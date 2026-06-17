import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  ReferenceLine, LabelList,
} from 'recharts';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  getStockDates,
  getStockEntriesForDate,
  getLatestStockDate,
  getAssetCategory,
} from '../config/stocks-data';
import type { StockEntry } from '../types';
import { formatCurrency, formatCurrencyWithDecimals, formatPercent, formatDateLabel } from '../lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  FII: '#3b82f6',
  ETF: '#a855f7',
  Ação: '#10b981',
};

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#6366f1', '#d97706', '#22c55e', '#e11d48', '#0ea5e9',
];

function fmt(v: number) {
  return formatCurrencyWithDecimals(v, 0);
}

function fmtQuote(v: number) {
  return formatCurrency(v);
}

function pct(v: number) {
  return formatPercent(v, 1);
}

// ─── Tooltip helpers ─────────────────────────────────────────────────────────

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

function PctTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {pct(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KPI({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  const color = positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

function ProfitPctChart({ entries }: { entries: StockEntry[] }) {
  const data = [...entries]
    .sort((a, b) => b.profitPct - a.profitPct)
    .map((e) => ({
      name: e.ticker,
      'Retorno (%)': e.profitPct,
      fill: e.profitPct >= 0 ? '#10b981' : '#ef4444',
    }));

  const barHeight = 32;
  const chartHeight = data.length * barHeight + 40;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">Retorno por Ativo (%)</h2>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={62} tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <Tooltip content={<PctTooltip />} />
          <ReferenceLine x={0} stroke="#6b7280" />
          <Bar dataKey="Retorno (%)" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="Retorno (%)"
              position="right"
              formatter={(v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`}
              style={{ fill: '#d1d5db', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TypeAllocationChart({
  entries,
  activeCategory,
  onCategoryChange,
}: {
  entries: StockEntry[];
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}) {
  // always compute from the full (unfiltered) entries so totals stay correct
  const grouped = entries.reduce<Record<string, { value: number; cost: number; profit: number; count: number }>>(
    (acc, e) => {
      const cat = getAssetCategory(e.ticker);
      if (!acc[cat]) acc[cat] = { value: 0, cost: 0, profit: 0, count: 0 };
      acc[cat].value += e.totalValue;
      acc[cat].cost += e.totalCost;
      acc[cat].profit += e.profitValue;
      acc[cat].count += 1;
      return acc;
    },
    {},
  );

  const total = Object.values(grouped).reduce((s, g) => s + g.value, 0);

  const pieData = Object.entries(grouped).map(([cat, g]) => ({
    name: cat,
    value: g.value,
    pct: g.value / total,
    profit: g.profit,
    count: g.count,
    color: CATEGORY_COLORS[cat] ?? '#6b7280',
  }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white">Alocação por Tipo de Ativo</h2>
        {activeCategory && (
          <button
            onClick={() => onCategoryChange(null)}
            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-0.5 rounded border border-gray-600 hover:border-gray-400"
          >
            Limpar filtro ×
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">Clique num card para filtrar todos os gráficos</p>

      <div className="flex flex-wrap gap-3">
        {pieData.map((d) => {
          const isActive = activeCategory === d.name;
          const isDimmed = activeCategory !== null && !isActive;
          return (
            <button
              key={d.name}
              onClick={() => onCategoryChange(isActive ? null : d.name)}
              className="flex-1 min-w-[120px] rounded-lg p-3 border text-left transition-all"
              style={{
                borderColor: isActive ? d.color : d.color + '55',
                background: isActive ? d.color + '33' : d.color + '18',
                opacity: isDimmed ? 0.4 : 1,
                boxShadow: isActive ? `0 0 0 2px ${d.color}66` : 'none',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: d.color }}>{d.name}</p>
              <p className="text-sm font-bold text-white">{fmt(d.value)}</p>
              <p className="text-xs text-gray-400">{(d.pct * 100).toFixed(1)}% · {d.count} ativo{d.count !== 1 ? 's' : ''}</p>
              <p className={`text-xs mt-0.5 font-medium ${d.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.profit >= 0 ? '+' : ''}{fmt(d.profit)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PortfolioAllocationChart({ entries }: { entries: StockEntry[] }) {
  const total = entries.reduce((s, e) => s + e.totalValue, 0);
  const data = [...entries]
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((e) => ({
      name: e.ticker,
      value: e.totalValue,
      pct: e.totalValue / total,
    }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    if (percent < 0.04) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">Distribuição da Carteira</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={renderLabel} labelLine={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload as { name: string; value: number; pct: number };
              return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl">
                  <p className="font-semibold text-white">{d.name}</p>
                  <p className="text-gray-300">{fmt(d.value)}</p>
                  <p className="text-gray-400">{(d.pct * 100).toFixed(1)}% da carteira</p>
                </div>
              );
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconSize={10}
            formatter={(value, _, index) => (
              <span style={{ color: '#d1d5db', fontSize: 11 }}>
                {value} ({(data[index]?.pct ?? 0) * 100 < 1 ? '<1' : ((data[index]?.pct ?? 0) * 100).toFixed(0)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PortfolioEvolutionChart({ activeCategory }: { activeCategory: string | null }) {
  const dates = getStockDates();
  const data = dates.map((date) => {
    const all = getStockEntriesForDate(date);
    const entries = activeCategory ? all.filter((e) => getAssetCategory(e.ticker) === activeCategory) : all;
    return {
      label: formatDateLabel(date),
      Total: entries.reduce((s, e) => s + e.totalValue, 0),
      Custo: entries.reduce((s, e) => s + e.totalCost, 0),
    };
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-1">Evolução do Patrimônio</h2>
      <p className="text-xs text-gray-500 mb-4">Valor total vs custo total ao longo do tempo</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip content={<CurrencyTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Custo" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopAssetsEvolutionChart({ activeCategory }: { activeCategory: string | null }) {
  const dates = getStockDates();
  // pick top tickers by latest value, respecting the category filter
  const latest = getStockEntriesForDate(getLatestStockDate());
  const filteredLatest = activeCategory ? latest.filter((e) => getAssetCategory(e.ticker) === activeCategory) : latest;
  const topTickers = [...filteredLatest]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 8)
    .map((e) => e.ticker);

  const lineColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  const data = dates.map((date) => {
    const entries = getStockEntriesForDate(date);
    const row: Record<string, string | number> = { label: formatDateLabel(date) };
    topTickers.forEach((t) => {
      const entry = entries.find((e) => e.ticker === t);
      row[t] = entry?.totalValue ?? 0;
    });
    return row;
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-1">Evolução dos Top 8 Ativos</h2>
      <p className="text-xs text-gray-500 mb-4">Valor total por ativo ao longo do tempo</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl">
                  <p className="font-semibold text-white mb-1">{label as string}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} style={{ color: p.color }}>
                      {p.dataKey}: {fmt(p.value as number)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          {topTickers.map((ticker, i) => (
            <Line
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stroke={lineColors[i % lineColors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopBottomReturnChart({
  activeCategory,
  label,
  months,
}: {
  activeCategory: string | null;
  label: string;
  months: number; // number of months back
}) {
  const dates = getStockDates();

  const latestDate = dates[dates.length - 1]!;
  const latestEntries = getStockEntriesForDate(latestDate);
  const filteredLatest = activeCategory
    ? latestEntries.filter((e) => getAssetCategory(e.ticker) === activeCategory)
    : latestEntries;
  const tickers = filteredLatest.map((e) => e.ticker);

  // Determine start date index
  const endIdx = dates.length - 1;
  const startIdx = Math.max(0, endIdx - months);
  const startDate = dates[startIdx]!;
  const startEntries = getStockEntriesForDate(startDate);

  const returns = tickers
    .map((ticker) => {
      const start = startEntries.find((e) => e.ticker === ticker);
      const end = latestEntries.find((e) => e.ticker === ticker);
      if (!start || !end || start.quote === 0) return null;
      return { ticker, pct: (end.quote - start.quote) / start.quote };
    })
    .filter((r): r is { ticker: string; pct: number } => r !== null)
    .sort((a, b) => b.pct - a.pct);

  const top7 = returns.slice(0, 7);
  const bottom7 = returns.slice(-7).reverse();

  const data = [
    ...top7.map((r) => ({ name: r.ticker, pct: r.pct, fill: '#10b981' })),
    ...bottom7
      .filter((r) => !top7.find((t) => t.ticker === r.ticker))
      .map((r) => ({ name: r.ticker, pct: r.pct, fill: '#ef4444' })),
  ].sort((a, b) => b.pct - a.pct);

  const barHeight = 32;
  const chartHeight = data.length * barHeight + 40;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-1">{label}</h2>
      <p className="text-xs text-gray-500 mb-4">
        Top 7 maiores e menores valorizações — {startDate} → {latestDate}
      </p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" width={62} tick={{ fill: '#d1d5db', fontSize: 11 }} />
          <Tooltip
            content={({ active, payload, label: l }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value as number;
              return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl">
                  <p className="font-semibold text-white">{l}</p>
                  <p style={{ color: v >= 0 ? '#10b981' : '#ef4444' }}>
                    {v >= 0 ? '+' : ''}{(v * 100).toFixed(2)}%
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="#6b7280" />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`}
              style={{ fill: '#d1d5db', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReturnEvolutionChart({ activeCategory }: { activeCategory: string | null }) {
  const dates = getStockDates();

  // Collect all tickers that appear in the filtered latest snapshot
  const latest = getStockEntriesForDate(getLatestStockDate());
  const filteredLatest = activeCategory
    ? latest.filter((e) => getAssetCategory(e.ticker) === activeCategory)
    : latest;
  const tickers = [...filteredLatest]
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((e) => e.ticker);

  const [hiddenTickers, setHiddenTickers] = useState<Set<string>>(new Set());
  const [showLabels, setShowLabels] = useState(false);

  function toggleTicker(ticker: string) {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }

  const lineColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
    '#6366f1', '#d97706', '#22c55e', '#e11d48', '#0ea5e9',
  ];

  const data = dates.map((date, idx) => {
    const allEntries = getStockEntriesForDate(date);
    const prevEntries = idx > 0 ? getStockEntriesForDate(dates[idx - 1]!) : [];
    const row: Record<string, string | number> = { label: formatDateLabel(date) };
    tickers.forEach((t) => {
      const curr = allEntries.find((e) => e.ticker === t);
      const prev = prevEntries.find((e) => e.ticker === t);
      if (curr == null || prev == null || prev.quote === 0) {
        row[t] = null as unknown as number;
      } else {
        row[t] = (curr.quote - prev.quote) / prev.quote;
      }
    });
    return row;
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white">Valorização Mensal por Ativo (%)</h2>
        <button
          onClick={() => setShowLabels((v) => !v)}
          className={`text-xs px-2 py-0.5 rounded border transition-all ${
            showLabels
              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
              : 'border-gray-600 bg-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {showLabels ? 'Ocultar labels' : 'Mostrar labels'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">Variação da cotação em relação ao mês anterior — clique na legenda para ocultar</p>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const sorted = [...payload].sort(
                (a, b) => (b.value as number) - (a.value as number),
              );
              return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm shadow-xl max-h-72 overflow-y-auto">
                  <p className="font-semibold text-white mb-2">{label as string}</p>
                  {sorted.map((p) => (
                    <p key={p.dataKey as string} style={{ color: p.color }} className="leading-5">
                      {p.dataKey}: {((p.value as number) * 100).toFixed(1)}%
                    </p>
                  ))}
                </div>
              );
            }}
          />
          {tickers.map((ticker, i) => (
            <Line
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stroke={lineColors[i % lineColors.length]}
              strokeWidth={hiddenTickers.has(ticker) ? 0 : 2}
              dot={showLabels && !hiddenTickers.has(ticker) ? { r: 3, fill: lineColors[i % lineColors.length] } : false}
              activeDot={hiddenTickers.has(ticker) ? false : { r: 4 }}
              connectNulls
            >
              {showLabels && !hiddenTickers.has(ticker) && (
                <LabelList
                  dataKey={ticker}
                  position="top"
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                  style={{ fill: lineColors[i % lineColors.length], fontSize: 9, fontWeight: 600 }}
                />
              )}
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <span className="text-xs text-gray-500">Ativos visíveis: {tickers.length - hiddenTickers.size}/{tickers.length}</span>
        <button
          onClick={() => {
            if (hiddenTickers.size === tickers.length) {
              setHiddenTickers(new Set());
            } else {
              setHiddenTickers(new Set(tickers));
            }
          }}
          className="text-xs px-2 py-0.5 rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition-all"
        >
          {hiddenTickers.size === tickers.length ? 'Mostrar todos' : 'Ocultar todos'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tickers.map((ticker, i) => {
          const hidden = hiddenTickers.has(ticker);
          return (
            <button
              key={ticker}
              onClick={() => toggleTicker(ticker)}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-all"
              style={{
                borderColor: hidden ? '#374151' : lineColors[i % lineColors.length] + '88',
                background: hidden ? '#1f2937' : lineColors[i % lineColors.length] + '22',
                color: hidden ? '#6b7280' : lineColors[i % lineColors.length],
              }}
            >
              <span
                className="inline-block w-3 h-0.5 rounded"
                style={{ background: hidden ? '#4b5563' : lineColors[i % lineColors.length] }}
              />
              {ticker}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Position Table ───────────────────────────────────────────────────────────

type SortField = 'ticker' | 'category' | 'quote' | 'quantity' | 'totalValue' | 'avgPrice' | 'totalCost' | 'profitValue' | 'profitPct';
type SortDir = 'asc' | 'desc';

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <span className="ml-1 text-gray-600">↕</span>;
  return <span className="ml-1 text-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function PositionTable({ entries }: { entries: StockEntry[] }) {
  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (sortField === 'ticker') {
        va = a.ticker;
        vb = b.ticker;
      } else if (sortField === 'category') {
        va = getAssetCategory(a.ticker);
        vb = getAssetCategory(b.ticker);
      } else {
        va = a[sortField];
        vb = b[sortField];
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [entries, sortField, sortDir]);

  function Th({ field, label, align = 'right' }: { field: SortField; label: string; align?: 'left' | 'right' }) {
    const active = field === sortField;
    return (
      <th
        className={`pb-2 pr-4 font-medium cursor-pointer select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'} ${active ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
        onClick={() => handleSort(field)}
      >
        {label}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </th>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 overflow-x-auto">
      <h2 className="text-base font-semibold text-white mb-4">Posições Atuais</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <Th field="ticker" label="Ativo" align="left" />
            <Th field="category" label="Tipo" align="left" />
            <Th field="quote" label="Cotação" />
            <Th field="quantity" label="Qtd" />
            <Th field="totalValue" label="Valor Total" />
            <Th field="avgPrice" label="Preço Médio" />
            <Th field="totalCost" label="Custo Total" />
            <Th field="profitValue" label="L/P (R$)" />
            <Th field="profitPct" label="Retorno" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => {
            const isPositive = e.profitValue >= 0;
            const category = getAssetCategory(e.ticker);
            const catColor = CATEGORY_COLORS[category] ?? '#6b7280';
            return (
              <tr key={e.ticker} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="py-2.5 pr-4 font-semibold text-white">{e.ticker}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: catColor + '22', color: catColor }}
                  >
                    {category}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right text-gray-300">{fmtQuote(e.quote)}</td>
                <td className="py-2.5 pr-4 text-right text-gray-300">{e.quantity}</td>
                <td className="py-2.5 pr-4 text-right font-medium text-white">{fmt(e.totalValue)}</td>
                <td className="py-2.5 pr-4 text-right text-gray-300">{fmt(e.avgPrice)}</td>
                <td className="py-2.5 pr-4 text-right text-gray-300">{fmt(e.totalCost)}</td>
                <td className={`py-2.5 pr-4 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{fmt(e.profitValue)}
                </td>
                <td className={`py-2.5 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{pct(e.profitPct)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Stocks() {
  const dates = getStockDates();
  const [selectedDate, setSelectedDate] = useState<string>(getLatestStockDate());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allEntries = useMemo(() => getStockEntriesForDate(selectedDate), [selectedDate]);

  // Reset category filter when date changes
  const entries = useMemo(() => {
    if (!activeCategory) return allEntries;
    return allEntries.filter((e) => getAssetCategory(e.ticker) === activeCategory);
  }, [allEntries, activeCategory]);

  const totalValue = useMemo(() => entries.reduce((s, e) => s + e.totalValue, 0), [entries]);
  const totalCost = useMemo(() => entries.reduce((s, e) => s + e.totalCost, 0), [entries]);
  const totalProfit = totalValue - totalCost;
  const totalReturn = totalCost > 0 ? totalProfit / totalCost : 0;

  const winners = entries.filter((e) => e.profitPct > 0).length;
  const losers = entries.filter((e) => e.profitPct < 0).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Carteira de Ativos</h1>
              <p className="text-xs text-gray-400">Bolsa Brasileira</p>
            </div>
          </div>

          {/* Date selector */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm text-gray-200 outline-none appearance-none pr-6 cursor-pointer"
              >
                {[...dates].reverse().map((d) => (
                  <option key={d} value={d} className="bg-gray-800">
                    {formatDateLabel(d)} ({d})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="text-gray-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
        {/* Type allocation filter */}
        <TypeAllocationChart
          entries={allEntries}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            label="Patrimônio Atual"
            value={fmt(totalValue)}
            sub={`${entries.length} ativos`}
          />
          <KPI
            label="Total Investido"
            value={fmt(totalCost)}
          />
          <KPI
            label="Lucro / Prejuízo"
            value={`${totalProfit >= 0 ? '+' : ''}${fmt(totalProfit)}`}
            positive={totalProfit >= 0}
          />
          <KPI
            label="Retorno Total"
            value={`${totalReturn >= 0 ? '+' : ''}${pct(totalReturn)}`}
            sub={`${winners} ganhos · ${losers} perdas`}
            positive={totalReturn >= 0}
          />
        </section>

        {/* Pie + Top 8 Evolution */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioAllocationChart entries={entries} />
          <TopAssetsEvolutionChart activeCategory={activeCategory} />
        </section>

        {/* Portfolio evolution - full width */}
        <PortfolioEvolutionChart activeCategory={activeCategory} />

        {/* Return evolution per asset */}
        <ReturnEvolutionChart activeCategory={activeCategory} />

        {/* Top/Bottom returns by period */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopBottomReturnChart activeCategory={activeCategory} label="Último Mês" months={1} />
          <TopBottomReturnChart activeCategory={activeCategory} label="Últimos 3 Meses" months={3} />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopBottomReturnChart activeCategory={activeCategory} label="Últimos 6 Meses" months={6} />
          <ProfitPctChart entries={entries} />
        </section>

        {/* Position Table */}
        <PositionTable entries={entries} />
      </main>
    </div>
  );
}
