export type YearlyResult = { year: number; value: number };
export type SavedInvestment = { id?: number; name: string; amount: number; rate: number; startYear: number; endYear: number; data: YearlyResult[] };
export type RetirementYearResult = { age: number; stocks: number; bonds: number; cash: number; total: number };
export type SavedRetirementPlan = {
  id?: number;
  currentAge: number;
  retirementAge: number;
  currentIncome: number;
  yearlyExpenses: number;
  currentSavings: number;
  stocksAllocation: number;
  stocksGrowth: number;
  bondsAllocation: number;
  bondsGrowth: number;
  cashAllocation: number;
  cashGrowth: number;
  data: RetirementYearResult[];
};