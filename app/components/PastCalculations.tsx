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

  useEffect(() => {
    const stored: SavedInvestment[] = JSON.parse(localStorage.getItem('investments') || '[]');
    setInvestments(stored);
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

  const handleDelete = (index: number) => {
    const updated = investments.filter((_, i) => i !== index);
    setInvestments(updated);
    localStorage.setItem('investments', JSON.stringify(updated));
    setSelected([]);
    setComparing(false);
  };

  const startEdit = (index: number) => {
    const inv = investments[index];
    setEditForm({ name: inv.name, amount: String(inv.amount), rate: String(inv.rate), startYear: String(inv.startYear), endYear: String(inv.endYear) });
    setEditingIndex(index);
  };

  const saveEdit = (index: number) => {
    const principal = parseFloat(editForm.amount);
    const rate = parseFloat(editForm.rate);
    const start = parseInt(editForm.startYear);
    const end = parseInt(editForm.endYear);

    if (isNaN(principal) || isNaN(rate) || isNaN(start) || isNaN(end) || end <= start) {
      alert('Please enter valid values, with end year after start year.');
      return;
    }

    const updatedEntry: SavedInvestment = { name: editForm.name || 'Untitled', amount: principal, rate, startYear: start, endYear: end, data: buildData(principal, rate, start, end) };
    const updated = investments.map((inv, i) => (i === index ? updatedEntry : inv));
    setInvestments(updated);
    localStorage.setItem('investments', JSON.stringify(updated));
    setEditingIndex(null);
  };

  if (investments.length === 0) {
    return <p className="text-gray-500">No past investments yet.</p>;
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
          <div key={i} className={`border rounded p-3 ${selected.includes(i) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            {editingIndex === i ? (
              <div className="flex flex-col gap-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="border border-gray-300 rounded px-2 py-1 text-gray-900" />
                <input value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} placeholder="Amount" type="number" className="border border-gray-300 rounded px-2 py-1 text-gray-900" />
                <input value={editForm.rate} onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })} placeholder="Rate %" type="number" className="border border-gray-300 rounded px-2 py-1 text-gray-900" />
                <div className="flex gap-2">
                  <input value={editForm.startYear} onChange={(e) => setEditForm({ ...editForm, startYear: e.target.value })} placeholder="Start year" type="number" className="border border-gray-300 rounded px-2 py-1 text-gray-900 w-full" />
                  <input value={editForm.endYear} onChange={(e) => setEditForm({ ...editForm, endYear: e.target.value })} placeholder="End year" type="number" className="border border-gray-300 rounded px-2 py-1 text-gray-900 w-full" />
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => saveEdit(i)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                  <button onClick={() => setEditingIndex(null)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div onClick={() => toggleSelect(i)} className="flex-1 cursor-pointer select-none flex items-baseline gap-2">
                  <p className={`font-semibold ${selected.includes(i) ? 'text-blue-700' : 'text-gray-900'}`}>{inv.name}</p>
                  <p className="text-xs text-gray-500">${inv.amount.toFixed(0)} at {inv.rate}%, {inv.startYear}–{inv.endYear}</p>
                </div>
                <button onClick={() => startEdit(i)} className="text-gray-500 hover:text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
                <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-800">
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
        <div className="mt-4 flex gap-6">
          <div className="w-1/2">
            <p className="font-semibold text-gray-900 mb-1">{investments[selected[0]].name}</p>
            <ResultsTable data={investments[selected[0]].data} />
          </div>
          <div className="w-1/2">
            <LineChart investments={buildRateScenarios(investments[selected[0]])} />
          </div>
        </div>
      )}

      {comparing && selected.length === 2 && (
        <div className="mt-4">
          <div className="inline-block border border-purple-200 bg-purple-50 rounded px-3 py-2 mb-4">
            <p className="text-xs text-gray-600">Combined final total</p>
            <p className="text-lg font-bold text-purple-700">
              ${(finalValue(investments[selected[0]]) + finalValue(investments[selected[1]])).toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500">
              {investments[selected[0]].name}: ${finalValue(investments[selected[0]]).toFixed(2)} + {investments[selected[1]].name}: ${finalValue(investments[selected[1]]).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-6">
            <div className="w-1/3">
              <p className="font-semibold text-gray-900 mb-1">{investments[selected[0]].name}</p>
              <ResultsTable data={investments[selected[0]].data} />
            </div>
            <div className="w-1/3">
              <p className="font-semibold text-gray-900 mb-1">{investments[selected[1]].name}</p>
              <ResultsTable data={investments[selected[1]].data} />
            </div>
            <div className="w-1/3">
              <LineChart investments={[investments[selected[0]], investments[selected[1]]]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}