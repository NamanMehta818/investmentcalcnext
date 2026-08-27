'use client';

import { useState } from 'react';
import PastCalculations from '../components/PastCalculations';
import InvestmentForm from '../components/InvestmentForm';
import { YearlyResult } from '../type/types';

export default function PastInvestmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCalculate = (data: YearlyResult[] | null) => {
    if (data) {
      setShowForm(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-950 p-6 gap-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Investments</h2>
          <button onClick={() => setShowForm(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 text-xl leading-none">
            +
          </button>
        </div>
        <PastCalculations refreshTrigger={refreshTrigger} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Investment Form</h1>
              <button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xl leading-none">×</button>
            </div>
            <InvestmentForm onCalculate={handleCalculate} />
          </div>
        </div>
      )}
    </div>
  );
}