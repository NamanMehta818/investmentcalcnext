'use client';

import PastRetirementPlans from '../components/PastRetirementPlans';

export default function PastRetirementPlansPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Past Retirement Plans</h1>
        <PastRetirementPlans />
      </div>
    </div>
  );
}