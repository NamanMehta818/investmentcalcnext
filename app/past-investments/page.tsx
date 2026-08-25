'use client';

import PastCalculations from '../components/PastCalculations';

export default function PastInvestmentsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-950 p-6 gap-4">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Past Investments</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select 2 investments below to compare them</p>
        </div>
        <PastCalculations refreshTrigger={0} />
      </div>
    </div>
  );
}