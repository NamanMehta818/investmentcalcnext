'use client';

import { useEffect, useState } from 'react';
import { RetirementYearResult, SavedRetirementPlan } from '../type/types';
import LineChart from './LineChart';

function buildRetirementData(currentAge: number, retirementAge: number, income: number, expenses: number, savings: number, stocksAlloc: number, stocksGrowth: number, bondsAlloc: number, bondsGrowth: number, cashAlloc: number, cashGrowth: number): RetirementYearResult[] {
  let stocksAmt = savings * stocksAlloc;
  let bondsAmt = savings * bondsAlloc;
  let cashAmt = savings * cashAlloc;

  const results: RetirementYearResult[] = [];
  for (let a = currentAge; a <= 110; a++) {
    const total = stocksAmt + bondsAmt + cashAmt;
    results.push({ age: a, stocks: stocksAmt, bonds: bondsAmt, cash: cashAmt, total });

    stocksAmt = stocksAmt * (1 + stocksGrowth);
    bondsAmt = bondsAmt * (1 + bondsGrowth);
    cashAmt = cashAmt * (1 + cashGrowth);

    const netFlow = (a < retirementAge ? income : 0) - expenses;

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
  return results;
}

export default function PastRetirementPlans() {
  const [plans, setPlans] = useState<SavedRetirementPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    currentAge: '', retirementAge: '', currentIncome: '', yearlyExpenses: '', currentSavings: '',
    stocksAllocation: '', stocksGrowth: '', bondsAllocation: '', bondsGrowth: '', cashAllocation: '', cashGrowth: '',
  });

  async function fetchPlans() {
    const res = await fetch('http://localhost:4000/retirement-plans');
    const raw = await res.json();
    return raw.map((p: any) => ({
      id: p.id,
      currentAge: Number(p.current_age),
      retirementAge: Number(p.retirement_age),
      currentIncome: Number(p.current_income),
      yearlyExpenses: Number(p.yearly_expenses),
      currentSavings: Number(p.current_savings),
      stocksAllocation: Number(p.stocks_allocation),
      stocksGrowth: Number(p.stocks_growth),
      bondsAllocation: Number(p.bonds_allocation),
      bondsGrowth: Number(p.bonds_growth),
      cashAllocation: Number(p.cash_allocation),
      cashGrowth: Number(p.cash_growth),
      data: p.data,
    }));
  }

  useEffect(() => {
    fetchPlans().then(setPlans);
  }, []);

  const handleDelete = async (index: number) => {
    const target = plans[index];
    setSelectedIndex(null);
    if (target.id) {
      await fetch(`http://localhost:4000/retirement-plans/${target.id}`, { method: 'DELETE' });
    }
    setPlans(await fetchPlans());
  };

  const startEdit = (index: number) => {
    const p = plans[index];
    setEditForm({
      currentAge: String(p.currentAge),
      retirementAge: String(p.retirementAge),
      currentIncome: String(p.currentIncome),
      yearlyExpenses: String(p.yearlyExpenses),
      currentSavings: String(p.currentSavings),
      stocksAllocation: String(p.stocksAllocation * 100),
      stocksGrowth: String(p.stocksGrowth * 100),
      bondsAllocation: String(p.bondsAllocation * 100),
      bondsGrowth: String(p.bondsGrowth * 100),
      cashAllocation: String(p.cashAllocation * 100),
      cashGrowth: String(p.cashGrowth * 100),
    });
    setEditingIndex(index);
  };

  const saveEdit = async (index: number) => {
    const currentAge = parseInt(editForm.currentAge);
    const retirementAge = parseInt(editForm.retirementAge);
    const currentIncome = parseFloat(editForm.currentIncome);
    const yearlyExpenses = parseFloat(editForm.yearlyExpenses);
    const currentSavings = parseFloat(editForm.currentSavings);
    const stocksAllocation = parseFloat(editForm.stocksAllocation) / 100;
    const stocksGrowth = parseFloat(editForm.stocksGrowth) / 100;
    const bondsAllocation = parseFloat(editForm.bondsAllocation) / 100;
    const bondsGrowth = parseFloat(editForm.bondsGrowth) / 100;
    const cashAllocation = parseFloat(editForm.cashAllocation) / 100;
    const cashGrowth = parseFloat(editForm.cashGrowth) / 100;

    if ([currentAge, retirementAge, currentIncome, yearlyExpenses, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth].some((v) => isNaN(v)) || retirementAge <= currentAge) {
      alert('Please enter valid values, with retirement age after current age.');
      return;
    }

    const data = buildRetirementData(currentAge, retirementAge, currentIncome, yearlyExpenses, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth);
    const existingId = plans[index].id;

    if (existingId) {
      await fetch(`http://localhost:4000/retirement-plans/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAge, retirementAge, currentIncome, yearlyExpenses, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth, data }),
      });
    }

    setEditingIndex(null);
    setPlans(await fetchPlans());
  };

  if (plans.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No past retirement plans yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {plans.map((plan, i) => (
          <div key={plan.id ?? i} className={`border rounded p-3 ${selectedIndex === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}`}>
            {editingIndex === i ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input value={editForm.currentAge} onChange={(e) => setEditForm({ ...editForm, currentAge: e.target.value })} placeholder="Current age" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                  <input value={editForm.retirementAge} onChange={(e) => setEditForm({ ...editForm, retirementAge: e.target.value })} placeholder="Retirement age" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                </div>
                <input value={editForm.currentIncome} onChange={(e) => setEditForm({ ...editForm, currentIncome: e.target.value })} placeholder="Current income" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
                <input value={editForm.yearlyExpenses} onChange={(e) => setEditForm({ ...editForm, yearlyExpenses: e.target.value })} placeholder="Yearly expenses" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
                <input value={editForm.currentSavings} onChange={(e) => setEditForm({ ...editForm, currentSavings: e.target.value })} placeholder="Current savings" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stocks</p>
                    <input value={editForm.stocksAllocation} onChange={(e) => setEditForm({ ...editForm, stocksAllocation: e.target.value })} placeholder="Alloc %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full mb-1" />
                    <input value={editForm.stocksGrowth} onChange={(e) => setEditForm({ ...editForm, stocksGrowth: e.target.value })} placeholder="Growth %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Bonds</p>
                    <input value={editForm.bondsAllocation} onChange={(e) => setEditForm({ ...editForm, bondsAllocation: e.target.value })} placeholder="Alloc %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full mb-1" />
                    <input value={editForm.bondsGrowth} onChange={(e) => setEditForm({ ...editForm, bondsGrowth: e.target.value })} placeholder="Growth %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Cash</p>
                    <input value={editForm.cashAllocation} onChange={(e) => setEditForm({ ...editForm, cashAllocation: e.target.value })} placeholder="Alloc %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full mb-1" />
                    <input value={editForm.cashGrowth} onChange={(e) => setEditForm({ ...editForm, cashGrowth: e.target.value })} placeholder="Growth %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button onClick={() => saveEdit(i)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                  <button onClick={() => setEditingIndex(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div onClick={() => setSelectedIndex(selectedIndex === i ? null : i)} className="flex-1 cursor-pointer select-none">
                  <p className={`font-semibold ${selectedIndex === i ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    Age {plan.currentAge} → {plan.retirementAge}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Income ${plan.currentIncome.toLocaleString()}, Expenses ${plan.yearlyExpenses.toLocaleString()}, Savings ${plan.currentSavings.toLocaleString()}
                  </p>
                </div>
                <button onClick={() => startEdit(i)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
                <button onClick={() => handleDelete(i)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <LineChart
          investments={[
            { name: 'Total', amount: 0, rate: 0, startYear: 0, endYear: 0, data: plans[selectedIndex].data.map((r) => ({ year: r.age, value: r.total })) },
            { name: 'Stocks', amount: 0, rate: 0, startYear: 0, endYear: 0, data: plans[selectedIndex].data.map((r) => ({ year: r.age, value: r.stocks })) },
            { name: 'Bonds', amount: 0, rate: 0, startYear: 0, endYear: 0, data: plans[selectedIndex].data.map((r) => ({ year: r.age, value: r.bonds })) },
            { name: 'Cash', amount: 0, rate: 0, startYear: 0, endYear: 0, data: plans[selectedIndex].data.map((r) => ({ year: r.age, value: r.cash })) },
          ]}
          primaryName="Total"
        />
      )}
    </div>
  );
}