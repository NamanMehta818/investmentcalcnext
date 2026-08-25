'use client';

import { useState } from 'react';
import RetirementForm from '../components/RetirementForm';
import LineChart from '../components/LineChart';
import { RetirementYearResult } from '../type/types';

export default function RetirementCalculatorPage() {
  const [results, setResults] = useState<RetirementYearResult[] | null>(null);

  const chartInvestments = results
    ? [
        { name: 'Total', amount: 0, rate: 0, startYear: 0, endYear: 0, data: results.map((r) => ({ year: r.age, value: r.total })) },
        { name: 'Stocks', amount: 0, rate: 0, startYear: 0, endYear: 0, data: results.map((r) => ({ year: r.age, value: r.stocks })) },
        { name: 'Bonds', amount: 0, rate: 0, startYear: 0, endYear: 0, data: results.map((r) => ({ year: r.age, value: r.bonds })) },
        { name: 'Cash', amount: 0, rate: 0, startYear: 0, endYear: 0, data: results.map((r) => ({ year: r.age, value: r.cash })) },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-950 p-6 gap-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Retirement Calculator</h1>
        <RetirementForm onCalculate={setResults} />

        {results && <LineChart investments={chartInvestments} primaryName="Total" />}
      </div>
    </div>
  );
}