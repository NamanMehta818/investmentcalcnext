'use client';

import { useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);

  const handleSubmit = () => {
    const principal = parseFloat(amount);
    const rate = parseFloat(result);
    const years = parseInt(endYear) - parseInt(startYear);

    if (isNaN(principal) || isNaN(rate) || isNaN(years) || years <= 0) {
      alert('fill in valid numbers');
      return;
    }

    const futureValue = principal * Math.pow(1 + rate / 100, years);
    setCalculatedValue(futureValue);
  };

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Investment Form</h1>

      <div className="mb-4">
        <label className="block mb-1">Amount you are investing:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Expected return (%):</label>
        <input type="text" value={result} onChange={(e) => setResult(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Year range:</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Start year" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
          <input type="number" placeholder="End year" value={endYear} onChange={(e) => setEndYear(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full" />
        </div>
      </div>

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Calculate return
      </button>

      {calculatedValue !== null && (
        <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded text-gray-900">
          <p className="text-lg font-semibold">
            Future value: ${calculatedValue.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}