'use client';

import { useState } from 'react';
import InvestmentForm from './components/InvestmentForm';
import ResultsTable from './components/table';
import ResultsChart from './components/graph';
import { YearlyResult } from './types';

export default function Home() {
  const [data, setData] = useState<YearlyResult[] | null>(null);
  const [view, setView] = useState<'table' | 'graph'>('table');

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Investment Form</h1>
      <InvestmentForm onCalculate={setData} />

      {data && (
        <>
          <button onClick={() => setView(view === 'table' ? 'graph' : 'table')} className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            Switch to {view === 'table' ? 'Graph' : 'Table'}
          </button>
          {view === 'table' ? <ResultsTable data={data} /> : <ResultsChart data={data} />}
        </>
      )}
    </div>
  );
}