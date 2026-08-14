'use client';

import { useEffect, useState } from 'react';
import { SavedInvestment } from '../type/types';
import LineChart from './LineChart';

type PastCalculationsProps = { refreshTrigger: number };

export default function PastCalculations({ refreshTrigger }: PastCalculationsProps) {
  const [investments, setInvestments] = useState<SavedInvestment[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const stored: SavedInvestment[] = JSON.parse(localStorage.getItem('investments') || '[]');
    setInvestments(stored);
    setSelected([]);
    setComparing(false);
  }, [refreshTrigger]);

  const toggleSelect = (index: number) => {
    setComparing(false);
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else if (selected.length < 2) {
      setSelected([...selected, index]);
    }
  };

  if (investments.length === 0) {
    return <p className="text-gray-500">No past calculations yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {investments.map((inv, i) => (
          <div key={i} className="flex items-center gap-2 border border-gray-200 rounded p-3">
            <input
              type="checkbox"
              checked={selected.includes(i)}
              onChange={() => toggleSelect(i)}
              disabled={!selected.includes(i) && selected.length >= 2}
            />
            <p className="font-semibold text-gray-900">{inv.name}</p>
          </div>
        ))}
      </div>

      <button onClick={() => setComparing(true)} disabled={selected.length !== 2} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Compare </button>

      {comparing && selected.length === 2 && (
        <LineChart investments={[investments[selected[0]], investments[selected[1]]]} />
      )}
    </div>
  );
}