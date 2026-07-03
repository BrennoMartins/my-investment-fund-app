// Dados estáticos de proventos recebidos e reinvestidos.
// Substituir por chamada à API quando disponível.
export interface DividendEntry {
  date: string;   // YYYY-MM-DD
  amount: number; // R$
}

export const DIVIDENDS: DividendEntry[] = [
  { date: '2026-01-31', amount: 576.60 },
  { date: '2026-02-28', amount: 527.95 },
  { date: '2026-03-31', amount: 592.50 },
  { date: '2026-04-30', amount: 716.40 },
  { date: '2026-05-31', amount: 626.26 },
  { date: '2026-06-30', amount: 584.63 },  
];
