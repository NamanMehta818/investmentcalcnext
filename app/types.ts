export type YearlyResult = { year: number; value: number };
export type SavedInvestment = { name: string; amount: number; rate: number; startYear: number; endYear: number; data: YearlyResult[] };