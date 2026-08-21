'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import YearSelect from './YearSelect';
import { YearlyResult, SavedInvestment } from '../type/types';

type InvestmentFormProps = { onCalculate: (data: YearlyResult[] | null) => void; };

export default function InvestmentForm({ onCalculate }: InvestmentFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartYear(newStart);
    if (endYear !== '' && parseInt(endYear) <= parseInt(newStart)) {
      setEndYear('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const principal = parseFloat(amount);
    const rate = parseFloat(result);
    const start = parseInt(startYear);
    const end = parseInt(endYear);

    if (isNaN(start) || isNaN(end)) {
      alert('select both a start and end year.');
      onCalculate(null);
      return;
    }

    const data: YearlyResult[] = [];
    for (let y = 0; y <= end - start; y++) {
      data.push({ year: start + y, value: principal * Math.pow(1 + rate / 100, y) });
    }
    onCalculate(data);

    const entry: SavedInvestment = { name: name || 'Untitled', amount: principal, rate, startYear: start, endYear: end, data };

    try {
      await fetch('http://localhost:4000/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error('Failed to save investment to database:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput label="Investment Name:" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      <FormInput label="Amount you are investing:" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} required />
      <FormInput label="Expected return (%):" type="number" value={result} onChange={(e) => setResult(e.target.value)} min={0} required />
      <div className="mb-4">
        <label className="block mb-1 text-gray-900">Year range:</label>
        <div className="flex gap-2">
          <YearSelect value={startYear} onChange={handleStartYearChange} placeholder="Start year" />
          <YearSelect value={endYear} onChange={(e) => setEndYear(e.target.value)} placeholder="End year" minYear={startYear ? parseInt(startYear) : undefined} disabled={!startYear} />
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Calculate return</button>
    </form>
  );
}