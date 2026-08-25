'use client';

import { useEffect, useState } from 'react';
import { SavedInvestment, YearlyResult } from '../type/types';
import LineChart from './LineChart';
import ResultsTable from './table';

type PastCalculationsProps = { refreshTrigger: number };

function buildData(principal: number, rate: number, start: number, end: number): YearlyResult[] {
  const data: YearlyResult[] = [];
  for (let y = 0; y <= end - start; y++) {
    data.push({ year: start + y, value: principal * Math.pow(1 + rate / 100, y) });
  }
  return data;
}

export default function PastCalculations({ refreshTrigger }: PastCalculationsProps) {
  const [investments, setInvestments] = useState<SavedInvestment[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '', rate: '', startYear: '', endYear: '' });
  const [resultView, setResultView] = useState<'table' | 'graph'>('graph');

  async function fetchInvestments() {
    const result = await fetch('http://localhost:4000/investments', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const raw = await result.json();
    return raw.map((inv: any) => ({
      ...inv,
      amount: Number(inv.amount),
      rate: Number(inv.rate),
      startYear: Number(inv.startYear ?? inv.start_year),
      endYear: Number(inv.endYear ?? inv.end_year),
    }));
  }

  useEffect(() => {
    fetchInvestments().then((data: SavedInvestment[]) => {
      setInvestments(data);
    });
    setSelected([]);
    setComparing(false);
    setEditingIndex(null);
  }, [refreshTrigger]);

  const toggleSelect = (index: number) => {
    setComparing(false);
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else if (selected.length < 2) {
      setSelected([...selected, index]);
    }
  };

  const handleDelete = async (index: number) => {
    const target = investments[index];
    setSelected([]);
    setComparing(false);

    if (target.id) {
      try {
        await fetch(`http://localhost:4000/investments/${target.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete from database:', err);
      }
    }

    const refreshed = await fetchInvestments();
    setInvestments(refreshed);
  };

  const startEdit = (index: number) => {
    const inv = investments[index];
    setEditForm({ name: inv.name, amount: String(inv.amount), rate: String(inv.rate), startYear: String(inv.startYear), endYear: String(inv.endYear) });
    setEditingIndex(index);
  };

  const saveEdit = async (index: number) => {
    const principal = parseFloat(editForm.amount);
    const rate = parseFloat(editForm.rate);
    const start = parseInt(editForm.startYear);
    const end = parseInt(editForm.endYear);

    if (isNaN(principal) || isNaN(rate) || isNaN(start) || isNaN(end) || end <= start) {
      alert('Please enter valid values, with end year after start year.');
      return;
    }

    const existingId = investments[index].id;
    const updatedEntry: SavedInvestment = { id: existingId, name: editForm.name || 'Untitled', amount: principal, rate, startYear: start, endYear: end, data: buildData(principal, rate, start, end) };
    setEditingIndex(null);

    if (existingId) {
      try {
        await fetch(`http://localhost:4000/investments/${existingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry),
        });
      } catch (err) {
        console.error('Failed to update database:', err);
      }
    }

    const refreshed = await fetchInvestments();
    setInvestments(refreshed);
  };

  if (investments.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No past investments yet.</p>;
  }

  const buildRateScenarios = (inv: SavedInvestment): SavedInvestment[] => [
    { ...inv, name: `${inv.name} (${(inv.rate - 2).toFixed(1)}%)`, rate: inv.rate - 2, data: buildData(inv.amount, inv.rate - 2, inv.startYear, inv.endYear) },
    { ...inv, name: `${inv.name} (${inv.rate}%)` },
    { ...inv, name: `${inv.name} (${(inv.rate + 2).toFixed(1)}%)`, rate: inv.rate + 2, data: buildData(inv.amount, inv.rate + 2, inv.startYear, inv.endYear) },
  ];

  const finalValue = (inv: SavedInvestment) => inv.data[inv.data.length - 1]?.value ?? 0;

  return (
    <div>
      <div className="flex flex-col gap-3">
        {investments.map((inv, i) => (
          <div key={i} className={`border rounded p-3 ${selected.includes(i) ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}`}>
            {editingIndex === i ? (
              <div className="flex flex-col gap-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
                <input value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} placeholder="Amount" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
                <input value={editForm.rate} onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })} placeholder="Rate %" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
                <div className="flex gap-2">
                  <input value={editForm.startYear} onChange={(e) => setEditForm({ ...editForm, startYear: e.target.value })} placeholder="Start year" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                  <input value={editForm.endYear} onChange={(e) => setEditForm({ ...editForm, endYear: e.target.value })} placeholder="End year" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => saveEdit(i)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                  <button onClick={() => setEditingIndex(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div onClick={() => toggleSelect(i)} className="flex-1 cursor-pointer select-none flex items-baseline gap-2">
                  <p className={`font-semibold ${selected.includes(i) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>{inv.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">${inv.amount} at {inv.rate}%, {inv.startYear}–{inv.endYear}</p>
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

      {selected.length > 0 && (
        <button onClick={() => setComparing(true)} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          {selected.length === 2 ? 'Compare' : 'View'}
        </button>
      )}

      {comparing && selected.length === 1 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{investments[selected[0]].name}</p>
            <button onClick={() => setResultView(resultView === 'table' ? 'graph' : 'table')} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Switch to {resultView === 'table' ? 'Graph' : 'Table'}
            </button>
          </div>
          {resultView === 'table' ? (
            <ResultsTable data={investments[selected[0]].data} />
          ) : (
            <LineChart investments={buildRateScenarios(investments[selected[0]])} />
          )}
        </div>
      )}

      {comparing && selected.length === 2 && (
        <div className="mt-4">
          <div className="flex items-start justify-between mb-4">
            <div className="inline-block border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 rounded px-3 py-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Combined final total</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                ${(finalValue(investments[selected[0]]) + finalValue(investments[selected[1]])).toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {investments[selected[0]].name}: ${finalValue(investments[selected[0]]).toFixed(2)} + {investments[selected[1]].name}: ${finalValue(investments[selected[1]]).toFixed(2)}
              </p>
            </div>

            <button onClick={() => setResultView(resultView === 'table' ? 'graph' : 'table')} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Switch to {resultView === 'table' ? 'Graph' : 'Table'}
            </button>
          </div>

          {resultView === 'table' ? (
            <div className="flex gap-6">
              <div className="w-1/2">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{investments[selected[0]].name}</p>
                <ResultsTable data={investments[selected[0]].data} />
              </div>
              <div className="w-1/2">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{investments[selected[1]].name}</p>
                <ResultsTable data={investments[selected[1]].data} />
              </div>
            </div>
          ) : (
            <LineChart investments={[investments[selected[0]], investments[selected[1]]]} />
          )}
        </div>
      )}
    </div>
  );
}