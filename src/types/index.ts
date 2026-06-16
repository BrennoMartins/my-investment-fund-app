export type ActiveFilter = { field: 'type' | 'country' | 'category'; value: string } | null;

export interface AssetHistory {
  id: number;
  date: string;
  asset: string;
  type: string;
  subType: string;
  quantity: number;
  averagePrice: number;
  quote: number;
  difference: number;
  returnRate: number;
  value: number;
  monthlyContribution: number | null;
  previousMonthValue: number | null;
  monthlyProfitPercentage: number | null;
  profit: number | null;
  portfolioPercentage: number;
  country: string;
  category: string;
  createdAt: string;
}
