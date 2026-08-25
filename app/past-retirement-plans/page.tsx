'use client';

import PastRetirementPlans from '../components/PastRetirementPlans';

export default function PastRetirementPlansPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-950 p-6 gap-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Past Retirement Plans</h1>
        <PastRetirementPlans />
      </div>
    </div>
  );
}