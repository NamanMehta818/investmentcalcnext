'use client';

import { useEffect, useState } from 'react';
import { RetirementEvent, RetirementYearResult, SavedInvestment } from '../type/types';
import { useSession } from '../lib/auth-client';

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

function getValueForYear(inv: SavedInvestment, year: number): number {
  const exact = inv.data.find((d) => d.year === year);
  if (exact) return exact.value;
  if (year < inv.data[0]?.year) return inv.data[0]?.value ?? 0;
  return inv.data[inv.data.length - 1]?.value ?? 0;
}

function getMonthlyReturnForInvestment(inv: SavedInvestment, year: number, month: number): number {
  const baseline = getValueForYear(inv, year - 1);
  const monthlyRate = Math.pow(1 + inv.rate / 100, 1 / 12) - 1;

  const valueAtMonth = baseline * Math.pow(1 + monthlyRate, month + 1);
  const valueAtPrevMonth = baseline * Math.pow(1 + monthlyRate, month);

  return valueAtMonth - valueAtPrevMonth;
}

function getMonthsSinceStartOfYear(): { label: string; year: number; month: number }[] {
  const months = [];
  const now = new Date();
  for (let m = now.getMonth(); m >= 0; m--) {
    const d = new Date(now.getFullYear(), m, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [investments, setInvestments] = useState<SavedInvestment[]>([]);
  const [onTrack, setOnTrack] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const months = getMonthsSinceStartOfYear();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const investmentsRes = await fetch('http://localhost:4000/investments');
      const rawInvestments = await investmentsRes.json();
      const parsedInvestments: SavedInvestment[] = rawInvestments.map((inv: any) => ({
        id: inv.id,
        name: inv.name,
        amount: Number(inv.amount),
        rate: Number(inv.rate),
        startYear: Number(inv.start_year),
        endYear: Number(inv.end_year),
        data: inv.data,
      }));
      setInvestments(parsedInvestments);

      if (session?.user?.id) {
        const plansRes = await fetch(`http://localhost:4000/retirement-plans?userId=${session.user.id}`);
        const rawPlans = await plansRes.json();

        if (rawPlans.length > 0) {
          const latest = rawPlans[rawPlans.length - 1];
          const eventsRes = await fetch(`http://localhost:4000/retirement-plans/${latest.id}/events`);
          const rawEvents = await eventsRes.json();
          const events: RetirementEvent[] = rawEvents.map((e: any) => ({
            id: e.id, planId: e.plan_id, name: e.name, age: Number(e.age),
            endAge: e.end_age !== null && e.end_age !== undefined ? Number(e.end_age) : null,
            amount: Number(e.amount),
          }));

          const data = buildRetirementData(
            Number(latest.current_age), Number(latest.retirement_age), Number(latest.current_income), Number(latest.current_savings),
            Number(latest.stocks_allocation), Number(latest.stocks_growth), Number(latest.bonds_allocation), Number(latest.bonds_growth),
            Number(latest.cash_allocation), Number(latest.cash_growth), events
          );

          const hitsZeroEarly = data.some((r) => r.age < 110 && r.total <= 0);
          setOnTrack(!hitsZeroEarly);
        } else {
          setOnTrack(null);
        }
      }

      setLoading(false);
    }

    load();
  }, [session?.user?.id]);

  const selectedMonth = months[selectedMonthIndex];
  const monthlyReturn = investments.reduce((sum, inv) => {
    return sum + getMonthlyReturnForInvestment(inv, selectedMonth.year, selectedMonth.month);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-950 p-6 gap-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <select
            value={selectedMonthIndex}
            onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{selectedMonth.label} investment return</p>
              {investments.length > 0 ? (
                <p className={`text-2xl font-bold ${monthlyReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {monthlyReturn >= 0 ? '+' : ''}${monthlyReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No investments yet</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Retirement plan status</p>
              {onTrack !== null ? (
                <p className={`text-2xl font-bold ${onTrack ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {onTrack ? 'On track' : 'Not on track'}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No retirement plan yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
