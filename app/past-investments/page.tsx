'use client';

import PastCalculations from '../components/PastCalculations';

export default function PastInvestmentsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6 gap-4">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Past Investments</h2>
        <PastCalculations refreshTrigger={0} />
      </div>
    </div>
  );
}