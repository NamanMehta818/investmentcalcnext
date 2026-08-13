'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import { YearlyResult, SavedInvestment } from '../types';

type InvestmentFormProps = { onCalculate: (data: YearlyResult[] | null) => void; };

export default function InvestmentForm({ onCalculate }: InvestmentFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleSubmit = () => {
    const principal = parseFloat(amount);
    const rate = parseFloat(result);
    const start = parseInt(startYear);
    const end = parseInt(endYear);

    if (isNaN(principal) || isNaN(rate) || isNaN(start) || isNaN(end)) {
      alert('fill in all fields with valid numbers.');
      onCalculate(null);
      return;
    }
    if (principal < 0) {
      alert('Investment cannot be negative.');
      onCalculate(null);
      return;
    }
    if (rate < 0) {
      alert('return cannot be negative.');
      onCalculate(null);
      return;
    }
    if (end <= start) {
      alert('End year must be after start year.');
      onCalculate(null);
      return;
    }

    const data: YearlyResult[] = [];
    for (let y = 0; y <= end - start; y++) {
      data.push({ year: start + y, value: principal * Math.pow(1 + rate / 100, y) });
    }
    onCalculate(data);

    const entry: SavedInvestment = { name: name || 'Untitled', amount: principal, rate, startYear: start, endYear: end, data };
    const existing: SavedInvestment[] = JSON.parse(localStorage.getItem('investments') || '[]');
    localStorage.setItem('investments', JSON.stringify([...existing, entry]));
  };

  return (
    <div>
      <FormInput label="Investment Name:" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <FormInput label="Amount you are investing:" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} />
      <FormInput label="Expected return (%):" type="number" value={result} onChange={(e) => setResult(e.target.value)} min={0} />
      <div className="mb-4">
        <label className="block mb-1">Year range:</label>
        <div className="flex gap-2">
          <FormInput label="" type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="Start year" />
          <FormInput label="" type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} placeholder="End year" />
        </div>
      </div>
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Calculate return</button>
    </div>
  );
}