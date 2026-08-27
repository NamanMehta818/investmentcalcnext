'use client';

import { useEffect, useState } from 'react';
import { RetirementEvent, RetirementYearResult, SavedRetirementPlan } from '../type/types';
import LineChart from './LineChart';
import { useSession } from '../lib/auth-client';

function parseAgeInput(input: string): { age: number; endAge: number | null } | null {
  const trimmed = input.trim();
  if (trimmed.includes('-')) {
    const [startStr, endStr] = trimmed.split('-').map((s) => s.trim());
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    if (isNaN(start) || isNaN(end) || end < start) return null;
    return { age: start, endAge: end };
  }
  const single = parseInt(trimmed);
  if (isNaN(single)) return null;
  return { age: single, endAge: null };
}

function formatAgeRange(age: number, endAge?: number | null): string {
  return endAge ? `${age}–${endAge}` : String(age);
}

function buildRetirementData(currentAge: number, retirementAge: number, income: number, savings: number, stocksAlloc: number, stocksGrowth: number, bondsAlloc: number, bondsGrowth: number, cashAlloc: number, cashGrowth: number, events: RetirementEvent[] = []): RetirementYearResult[] {
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

    const eventAmount = events
      .filter((ev) => a >= ev.age && a <= (ev.endAge ?? ev.age))
      .reduce((sum, ev) => sum + ev.amount, 0);
    const netFlow = (a < retirementAge ? income : 0) + eventAmount;

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
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SavedRetirementPlan[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    currentAge: '', retirementAge: '', currentIncome: '', currentSavings: '',
    stocksAllocation: '', stocksGrowth: '', bondsAllocation: '', bondsGrowth: '', cashAllocation: '', cashGrowth: '',
  });

  const [events, setEvents] = useState<RetirementEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ name: '', age: '', amount: '', type: 'expense' });
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editEventForm, setEditEventForm] = useState({ name: '', age: '', amount: '', type: 'expense' });

  async function fetchPlans() {
    if (!session?.user?.id) return [];
    const res = await fetch(`http://localhost:4000/retirement-plans?userId=${session.user.id}`);
    const raw = await res.json();
    return raw.map((p: any) => ({
      id: p.id,
      currentAge: Number(p.current_age),
      retirementAge: Number(p.retirement_age),
      currentIncome: Number(p.current_income),
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

  async function fetchEvents(planId: number) {
    const res = await fetch(`http://localhost:4000/retirement-plans/${planId}/events`);
    const raw = await res.json();
    return raw.map((e: any) => ({ id: e.id, planId: e.plan_id, name: e.name, age: Number(e.age), endAge: e.end_age !== null && e.end_age !== undefined ? Number(e.end_age) : null, amount: Number(e.amount) }));
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchPlans().then((data) => {
      setPlans(data);
      if (data.length > 0 && data[0].id) {
        fetchEvents(data[0].id).then(setEvents);
      }
    });
  }, [session?.user?.id]);

  const plan = plans.length > 0 ? plans[0] : null;

  const handleDelete = async () => {
    if (!plan?.id) return;
    await fetch(`http://localhost:4000/retirement-plans/${plan.id}`, { method: 'DELETE' });
    setPlans(await fetchPlans());
    setEvents([]);
  };

  const startEdit = () => {
    if (!plan) return;
    setEditForm({
      currentAge: String(plan.currentAge),
      retirementAge: String(plan.retirementAge),
      currentIncome: String(plan.currentIncome),
      currentSavings: String(plan.currentSavings),
      stocksAllocation: String(plan.stocksAllocation * 100),
      stocksGrowth: String(plan.stocksGrowth * 100),
      bondsAllocation: String(plan.bondsAllocation * 100),
      bondsGrowth: String(plan.bondsGrowth * 100),
      cashAllocation: String(plan.cashAllocation * 100),
      cashGrowth: String(plan.cashGrowth * 100),
    });
    setEditingIndex(0);
  };

  const saveEdit = async () => {
    if (!plan) return;
    const currentAge = parseInt(editForm.currentAge);
    const retirementAge = parseInt(editForm.retirementAge);
    const currentIncome = parseFloat(editForm.currentIncome);
    const currentSavings = parseFloat(editForm.currentSavings);
    const stocksAllocation = parseFloat(editForm.stocksAllocation) / 100;
    const stocksGrowth = parseFloat(editForm.stocksGrowth) / 100;
    const bondsAllocation = parseFloat(editForm.bondsAllocation) / 100;
    const bondsGrowth = parseFloat(editForm.bondsGrowth) / 100;
    const cashAllocation = parseFloat(editForm.cashAllocation) / 100;
    const cashGrowth = parseFloat(editForm.cashGrowth) / 100;

    if ([currentAge, retirementAge, currentIncome, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth].some((v) => isNaN(v)) || retirementAge <= currentAge) {
      alert('Please enter valid values, with retirement age after current age.');
      return;
    }

    const existingId = plan.id;
    const planEvents = existingId ? await fetchEvents(existingId) : [];
    const data = buildRetirementData(currentAge, retirementAge, currentIncome, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth, planEvents);

    if (existingId) {
      await fetch(`http://localhost:4000/retirement-plans/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAge, retirementAge, currentIncome, currentSavings, stocksAllocation, stocksGrowth, bondsAllocation, bondsGrowth, cashAllocation, cashGrowth, data }),
      });
    }

    setEditingIndex(null);
    setPlans(await fetchPlans());
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan?.id) return;

    const parsed = parseAgeInput(eventForm.age);
    const rawAmount = parseFloat(eventForm.amount);
    if (!eventForm.name || !parsed || isNaN(rawAmount) || rawAmount < 0) {
      alert('Please fill in a name, a valid age or age range (e.g. 65 or 60-70), and a positive amount.');
      return;
    }
    const amount = eventForm.type === 'expense' ? -rawAmount : rawAmount;

    await fetch(`http://localhost:4000/retirement-plans/${plan.id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: eventForm.name, age: parsed.age, endAge: parsed.endAge, amount }),
    });

    setEventForm({ name: '', age: '', amount: '', type: 'expense' });
    setShowEventForm(false);
    setEvents(await fetchEvents(plan.id));
  };

  const handleDeleteEvent = async (eventId: number) => {
    await fetch(`http://localhost:4000/retirement-events/${eventId}`, { method: 'DELETE' });
    if (plan?.id) {
      setEvents(await fetchEvents(plan.id));
    }
  };

  const startEditEvent = (ev: RetirementEvent) => {
    setEditEventForm({
      name: ev.name,
      age: formatAgeRange(ev.age, ev.endAge).replace('–', '-'),
      amount: String(Math.abs(ev.amount)),
      type: ev.amount < 0 ? 'expense' : 'gain',
    });
    setEditingEventId(ev.id ?? null);
  };

  const saveEditEvent = async (eventId: number) => {
    const parsed = parseAgeInput(editEventForm.age);
    const rawAmount = parseFloat(editEventForm.amount);
    if (!editEventForm.name || !parsed || isNaN(rawAmount) || rawAmount < 0) {
      alert('Please fill in a name, a valid age or age range (e.g. 65 or 60-70), and a positive amount.');
      return;
    }
    const amount = editEventForm.type === 'expense' ? -rawAmount : rawAmount;

    await fetch(`http://localhost:4000/retirement-events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editEventForm.name, age: parsed.age, endAge: parsed.endAge, amount }),
    });

    setEditingEventId(null);
    if (plan?.id) {
      setEvents(await fetchEvents(plan.id));
    }
  };

  if (!plan) {
    return <p className="text-gray-500 dark:text-gray-400">No past retirement plans yet.</p>;
  }

  const chartData = buildRetirementData(
    plan.currentAge, plan.retirementAge, plan.currentIncome, plan.currentSavings,
    plan.stocksAllocation, plan.stocksGrowth, plan.bondsAllocation, plan.bondsGrowth, plan.cashAllocation, plan.cashGrowth,
    events
  );

  const expenseEvents = events.filter((ev) => ev.amount < 0);
  const gainEvents = events.filter((ev) => ev.amount >= 0);

  const renderEvent = (ev: RetirementEvent) => (
    <div key={ev.id} className="border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
      {editingEventId === ev.id ? (
        <div className="flex flex-col gap-2">
          <input value={editEventForm.name} onChange={(e) => setEditEventForm({ ...editEventForm, name: e.target.value })} placeholder="Event name" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
          <div className="flex gap-2">
            <input value={editEventForm.age} onChange={(e) => setEditEventForm({ ...editEventForm, age: e.target.value })} placeholder="Age (e.g. 65 or 60-70)" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3" />
            <select value={editEventForm.type} onChange={(e) => setEditEventForm({ ...editEventForm, type: e.target.value })} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3">
              <option value="expense">Expense</option>
              <option value="gain">Gain</option>
            </select>
            <input value={editEventForm.amount} onChange={(e) => setEditEventForm({ ...editEventForm, amount: e.target.value })} placeholder="Amount" type="number" min={0} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => ev.id && saveEditEvent(ev.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setEditingEventId(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-900 dark:text-gray-100">{ev.name} — Age {formatAgeRange(ev.age, ev.endAge)}: {ev.amount >= 0 ? '+' : ''}${ev.amount.toLocaleString()}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => startEditEvent(ev)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            </button>
            <button onClick={() => ev.id && handleDeleteEvent(ev.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {editingIndex === 0 ? (
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <input value={editForm.currentAge} onChange={(e) => setEditForm({ ...editForm, currentAge: e.target.value })} placeholder="Current age" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
            <input value={editForm.retirementAge} onChange={(e) => setEditForm({ ...editForm, retirementAge: e.target.value })} placeholder="Retirement age" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
          </div>
          <input value={editForm.currentIncome} onChange={(e) => setEditForm({ ...editForm, currentIncome: e.target.value })} placeholder="Current income" type="number" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
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
            <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
            <button onClick={() => setEditingIndex(null)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Age {plan.currentAge} to {plan.retirementAge}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Income ${plan.currentIncome.toLocaleString()}, Savings ${plan.currentSavings.toLocaleString()}
            </p>
          </div>
          <button onClick={startEdit} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
          </button>
          <button onClick={handleDelete} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-end mb-3">
        <button onClick={() => setShowEventForm(!showEventForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Event
        </button>
      </div>

      {showEventForm && (
        <form onSubmit={handleAddEvent} className="flex flex-col gap-2 mb-4 border border-gray-200 dark:border-gray-700 rounded p-3">
          <input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} placeholder="Event name (e.g. Bought a car)" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-full" />
          <div className="flex gap-2">
            <input value={eventForm.age} onChange={(e) => setEventForm({ ...eventForm, age: e.target.value })} placeholder="Age (e.g. 65 or 60-70)" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3" />
            <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3">
              <option value="expense">Expense</option>
              <option value="gain">Gain</option>
            </select>
            <input value={eventForm.amount} onChange={(e) => setEventForm({ ...eventForm, amount: e.target.value })} placeholder="Amount" type="number" min={0} className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 w-1/3" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 self-start">Save</button>
        </form>
      )}

      <LineChart
        investments={[
          { name: 'Total', amount: 0, rate: 0, startYear: 0, endYear: 0, data: chartData.map((r) => ({ year: r.age, value: r.total })) },
          { name: 'Stocks', amount: 0, rate: 0, startYear: 0, endYear: 0, data: chartData.map((r) => ({ year: r.age, value: r.stocks })) },
          { name: 'Bonds', amount: 0, rate: 0, startYear: 0, endYear: 0, data: chartData.map((r) => ({ year: r.age, value: r.bonds })) },
          { name: 'Cash', amount: 0, rate: 0, startYear: 0, endYear: 0, data: chartData.map((r) => ({ year: r.age, value: r.cash })) },
        ]}
        primaryName="Total"
      />

      {events.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Expenses</p>
            <div className="flex flex-col gap-1">
              {expenseEvents.length > 0 ? expenseEvents.map(renderEvent) : <p className="text-sm text-gray-500 dark:text-gray-400">None</p>}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gains</p>
            <div className="flex flex-col gap-1">
              {gainEvents.length > 0 ? gainEvents.map(renderEvent) : <p className="text-sm text-gray-500 dark:text-gray-400">None</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}