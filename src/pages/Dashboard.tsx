import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart2, TrendingDown, TrendingUp, Wallet, X } from 'lucide-react';
import { fetchAssetHistory } from '../services/api';
import type { ActiveFilter } from '../types';
import { KPICard } from '../components/KPICard';
import { PortfolioEvolutionChart } from '../components/PortfolioEvolutionChart';
import { AllocationPieChart } from '../components/AllocationPieChart';
import { AssetTable } from '../components/AssetTable';
import { MonthlyProfitChart } from '../components/MonthlyProfitChart';
import { DividendChart } from '../components/DividendChart';
import { CountryAllocationChart } from '../components/CountryAllocationChart';
import { CategoryAllocationChart } from '../components/CategoryAllocationChart';
import { MONTHLY_RESULTM } from '../config/monthly-resultm';
import {
  formatCurrency,
  formatCurrencyWithDecimals,
  formatDateLabel,
  formatPercent,
  getAssetsForDate,
  getLatestDate,
} from '../lib/utils';

export function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['assetHistory'],
    queryFn: fetchAssetHistory,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error != null || data == null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Erro ao carregar dados</p>
          <p className="text-gray-500 mt-1 text-sm">
            {error instanceof Error ? error.message : 'Verifique se a API está disponível.'}
          </p>
        </div>
      </div>
    );
  }

  const latestDate = getLatestDate(data);
  const latestAssets = getAssetsForDate(data, latestDate);

  const filteredAssets = activeFilter
    ? latestAssets.filter((a) => a[activeFilter.field] === activeFilter.value)
    : latestAssets;

  const filteredData = activeFilter
    ? data.filter((a) => a[activeFilter.field] === activeFilter.value)
    : data;

  const latestMonthlyResult = MONTHLY_RESULTM[MONTHLY_RESULTM.length - 1];
  const monthlyResultDateLabel =
    latestMonthlyResult != null ? formatDateLabel(latestMonthlyResult.month) : 'Sem dados';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Investment Fund Dashboard</h1>
              <p className="text-xs text-gray-400">Análise de performance dos ativos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última atualização</p>
            <p className="text-sm font-medium text-gray-200">{formatDateLabel(latestDate)}</p>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Active filter badge */}
        {activeFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Filtro ativo:</span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-900/60 text-blue-300 border border-blue-700 rounded-full text-xs font-medium">
              {activeFilter.value}
              <button
                onClick={() => setActiveFilter(null)}
                className="hover:text-white transition-colors"
                aria-label="Remover filtro"
              >
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {/* KPI Cards */}
        {latestMonthlyResult != null && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Aporte"
              value={formatCurrencyWithDecimals(latestMonthlyResult.contribution, 0)}
              subtitle={monthlyResultDateLabel}
              icon={BarChart2}
            />
            <KPICard
              title="Patrimônio"
              value={formatCurrencyWithDecimals(latestMonthlyResult.wallet, 0)}
              subtitle={monthlyResultDateLabel}
              icon={Wallet}
            />
            <KPICard
              title="Lucro Total"
              value={formatCurrencyWithDecimals(latestMonthlyResult.profit, 0)}
              subtitle={formatPercent(latestMonthlyResult.profitPercentage, 0)}
              icon={latestMonthlyResult.profit >= 0 ? TrendingUp : TrendingDown}
              valueColor={latestMonthlyResult.profit >= 0 ? 'text-green-400' : 'text-red-400'}
            />
            <KPICard
              title="Lucro no Mês"
              value={formatCurrencyWithDecimals(latestMonthlyResult.monthlyProfit, 0)}
              subtitle={monthlyResultDateLabel}
              icon={latestMonthlyResult.monthlyProfit >= 0 ? TrendingUp : TrendingDown}
              valueColor={latestMonthlyResult.monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}
            />
            <KPICard
              title="Rentabilidade Total"
              value={formatPercent(latestMonthlyResult.profitPercentage, 0)}
              subtitle="Sobre o capital aportado"
              icon={Activity}
              valueColor={latestMonthlyResult.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}
            />
            <KPICard
              title="Crescimento Mensal"
              value={formatPercent(latestMonthlyResult.growthPercentage)}
              subtitle={monthlyResultDateLabel}
              icon={latestMonthlyResult.growthPercentage >= 0 ? TrendingUp : TrendingDown}
              valueColor={latestMonthlyResult.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}
            />
          </div>
        )}

        {/* Evolution chart full width */}
        <PortfolioEvolutionChart data={filteredData} />

        {/* Three donut charts side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AllocationPieChart
            assets={filteredAssets}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <CountryAllocationChart
            assets={filteredAssets}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <CategoryAllocationChart
            assets={filteredAssets}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Monthly Profit Bar Chart */}
        <MonthlyProfitChart data={filteredData} />

        {/* Dividends */}
        <DividendChart />

        {/* Asset Table */}
        <AssetTable assets={filteredAssets} />
      </main>
    </div>
  );
}
