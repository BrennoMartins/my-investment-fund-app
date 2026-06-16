// Dados estaticos de resultado mensal.
// Substituir por chamada a API quando disponivel.
export interface MonthlyResultmEntry {
	month: string; // YYYY-MM-DD
	contribution: number;
	wallet: number;
	profit: number;
	profitPercentage: number;
	monthlyProfit: number;
	growthPercentage: number;
}

export const MONTHLY_RESULTM: MonthlyResultmEntry[] = [
	/*{
		month: '2025-08-01',
		contribution: 122301.0,
		wallet: 148829.0,
		profit: 26528.0,
		profitPercentage: 0.2169,
		monthlyProfit: 0.0,
		growthPercentage: 0.0,
	},
	{
		month: '2025-09-01',
		contribution: 90160.0,
		wallet: 116953.0,
		profit: 26793.0,
		profitPercentage: 0.2972,
		monthlyProfit: 265.0,
		growthPercentage: 0.0023,
	},
	{
		month: '2025-10-01',
		contribution: 91460.0,
		wallet: 120022.0,
		profit: 28562.0,
		profitPercentage: 0.3123,
		monthlyProfit: 1769.0,
		growthPercentage: 0.015,
	},
	{
		month: '2025-11-01',
		contribution: 105880.0,
		wallet: 136831.0,
		profit: 30951.0,
		profitPercentage: 0.2923,
		monthlyProfit: 2389.0,
		growthPercentage: 0.0178,
	},
	{
		month: '2025-12-01',
		contribution: 114141.0,
		wallet: 147239.0,
		profit: 33098.0,
		profitPercentage: 0.29,
		monthlyProfit: 2147.0,
		growthPercentage: 0.0148,
	},*/
	{
		month: '2026-01-01',
		contribution: 116371.0,
		wallet: 154910.0,
		profit: 38539.0,
		profitPercentage: 0.3312,
		monthlyProfit: 5441.0,
		growthPercentage: 0.0364,
	},
	{
		month: '2026-02-01',
		contribution: 116821.0,
		wallet: 156783.0,
		profit: 39962.0,
		profitPercentage: 0.3421,
		monthlyProfit: 1423.0,
		growthPercentage: 0.0092,
	},
	{
		month: '2026-03-01',
		contribution: 133301.0,
		wallet: 168486.0,
		profit: 35185.0,
		profitPercentage: 0.264,
		monthlyProfit: -4777.0,
		growthPercentage: -0.0276,
	},
	{
		month: '2026-04-01',
		contribution: 134251.0,
		wallet: 173937.0,
		profit: 39686.0,
		profitPercentage: 0.2956,
		monthlyProfit: 4501.0,
		growthPercentage: 0.0266,
	},
	{
		month: '2026-05-01',
		contribution: 135811.0,
		wallet: 174264.0,
		profit: 38453.0,
		profitPercentage: 0.2831,
		monthlyProfit: -1233.0,
		growthPercentage: -0.007,
	},
	{
		month: '2026-06-01',
		contribution: 141521.0,
		wallet: 174874.0,
		profit: 33353.0,
		profitPercentage: 0.2357,
		monthlyProfit: -5100.0,
		growthPercentage: -0.0283,
	},
];
