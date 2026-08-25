'use client';

import { useState } from 'react';
import FormInput from './FormInput';
import { RetirementYearResult } from '../type/types';

type AssetClass = { allocation: string; growth: string };

type RetirementFormProps = { onCalculate: (data: RetirementYearResult[] | null) => void; };

export default function RetirementForm({ onCalculate }: RetirementFormProps) {
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [currentIncome, setCurrentIncome] = useState('');
  const [yearlyExpenses, setYearlyExpenses] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');

  const [stocks, setStocks] = useState<AssetClass>({ allocation: '', growth: '' });
  const [bonds, setBonds] = useState<AssetClass>({ allocation: '', growth: '' });
  const [cash, setCash] = useState<AssetClass>({ allocation: '', growth: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const age = parseInt(currentAge);
    const retireAge = parseInt(retirementAge);
    const income = parseFloat(currentIncome);
    const expenses = parseFloat(yearlyExpenses);
    const savings = parseFloat(currentSavings);

    const stocksAlloc = parseFloat(stocks.allocation) / 100;
    const bondsAlloc = parseFloat(bonds.allocation) / 100;
    const cashAlloc = parseFloat(cash.allocation) / 100;
    const stocksGrowth = parseFloat(stocks.growth) / 100;
    const bondsGrowth = parseFloat(bonds.growth) / 100;
    const cashGrowth = parseFloat(cash.growth) / 100;

    if (isNaN(age) || isNaN(retireAge) || isNaN(income) || isNaN(expenses) || isNaN(savings) || retireAge <= age) {
      alert('Please fill in valid ages (retirement age must be after current age), income, expenses, and savings.');
      onCalculate(null);
      return;
    }
    if (isNaN(stocksAlloc) || isNaN(bondsAlloc) || isNaN(cashAlloc) || isNaN(stocksGrowth) || isNaN(bondsGrowth) || isNaN(cashGrowth)) {
      alert('Please fill in all allocation and growth fields.');
      onCalculate(null);
      return;
    }

    let stocksAmt = savings * stocksAlloc;
    let bondsAmt = savings * bondsAlloc;
    let cashAmt = savings * cashAlloc;

    const results = [];
    for (let a = age; a <= 110; a++) {
      const total = stocksAmt + bondsAmt + cashAmt;
      results.push({ age: a, stocks: stocksAmt, bonds: bondsAmt, cash: cashAmt, total });

      stocksAmt = stocksAmt * (1 + stocksGrowth);
      bondsAmt = bondsAmt * (1 + bondsGrowth);
      cashAmt = cashAmt * (1 + cashGrowth);

      const netFlow = (a < retireAge ? income : 0) - expenses;

      if (netFlow >= 0) {
        stocksAmt += netFlow * stocksAlloc;
        bondsAmt += netFlow * bondsAlloc;
        cashAmt += netFlow * cashAlloc;
      } else if (total > 0) {
        stocksAmt += netFlow * (stocksAmt / total);
        bondsAmt += netFlow * (bondsAmt / total);
        cashAmt += netFlow * (cashAmt / total);
      }

      stocksAmt = Math.max(0, stocksAmt);
      bondsAmt = Math.max(0, bondsAmt);
      cashAmt = Math.max(0, cashAmt);
    }

    onCalculate(results);

    try {
      await fetch('http://localhost:4000/retirement-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAge: age,
          retirementAge: retireAge,
          currentIncome: income,
          yearlyExpenses: expenses,
          currentSavings: savings,
          stocksAllocation: stocksAlloc,
          stocksGrowth,
          bondsAllocation: bondsAlloc,
          bondsGrowth,
          cashAllocation: cashAlloc,
          cashGrowth,
          data: results,
        }),
      });
    } catch (err) {
      console.error('Failed to save retirement plan to database:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput label="Current age:" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} min={0} required />
      <FormInput label="Retirement age:" type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} min={0} required />
      <FormInput label="Current income:" type="number" value={currentIncome} onChange={(e) => setCurrentIncome(e.target.value)} min={0} required />
      <FormInput label="Yearly expenses:" type="number" value={yearlyExpenses} onChange={(e) => setYearlyExpenses(e.target.value)} min={0} required />
      <FormInput label="Current savings:" type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} min={0} required />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">Stocks</p>
          <FormInput label="Allocation (%):" type="number" value={stocks.allocation} onChange={(e) => setStocks({ ...stocks, allocation: e.target.value })} min={0} required />
          <FormInput label="Annual Growth (%):" type="number" value={stocks.growth} onChange={(e) => setStocks({ ...stocks, growth: e.target.value })} min={0} required />
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">Bonds</p>
          <FormInput label="Allocation (%):" type="number" value={bonds.allocation} onChange={(e) => setBonds({ ...bonds, allocation: e.target.value })} min={0} required />
          <FormInput label="Annual Growth (%):" type="number" value={bonds.growth} onChange={(e) => setBonds({ ...bonds, growth: e.target.value })} min={0} required />
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">Cash</p>
          <FormInput label="Allocation (%):" type="number" value={cash.allocation} onChange={(e) => setCash({ ...cash, allocation: e.target.value })} min={0} required />
          <FormInput label="Annual Growth (%):" type="number" value={cash.growth} onChange={(e) => setCash({ ...cash, growth: e.target.value })} min={0} required />
        </div>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Calculate</button>
    </form>
  );
}