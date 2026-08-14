'use client';

import { useState } from 'react';
import InvestmentForm from './components/InvestmentForm';
import ResultsTable from './components/table';
import LineChart from './components/LineChart';
import PastCalculations from './components/PastCalculations';
import { YearlyResult } from './type/types';

export default function Home() {
  const [data, setData] = useState<YearlyResult[] | null>(null);
  const [view, setView] = useState<'table' | 'graph'>('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCalculate = (newData: YearlyResult[] | null) => {
    setData(newData);
    if (newData) setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-6 gap-6">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Investment Form</h1>
        <InvestmentForm onCalculate={handleCalculate} />

        {data && (
          <>
            <button onClick={() => setView(view === 'table' ? 'graph' : 'table')} className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Switch to {view === 'table' ? 'Graph' : 'Table'}
            </button>
            {view === 'table' ? <ResultsTable data={data} /> : <LineChart investments={[{ name: 'Result', amount: 0, rate: 0, startYear: 0, endYear: 0, data }]} />}
          </>
        )}
      </div>

      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Past Calculations</h2>
        <PastCalculations refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}