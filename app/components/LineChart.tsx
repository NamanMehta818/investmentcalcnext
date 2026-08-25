'use client';

import ReactECharts from 'echarts-for-react';
import { SavedInvestment } from '../type/types';

type LineChartProps = { investments: SavedInvestment[]; primaryName?: string };

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];

export default function LineChart({ investments, primaryName }: LineChartProps) {
  const option = {
    grid: { top: 40, left: 50, right: 20, bottom: 40 },
    xAxis: { type: 'value', name: 'Year', min: 'dataMin', max: 'dataMax' },
    yAxis: { type: 'value' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        if (params.length === 0) return '';
        const year = params[0].value[0];
        let lines = `Year: ${year}<br/>`;
        let total = 0;
        params.forEach((p) => {
          const value = p.value[1];
          total += value;
          lines += `${p.marker} ${p.seriesName}: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>`;
        });
        if (params.length > 1 && !primaryName) {
          lines += `<strong>Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`;
        }
        return lines;
      },
    },
    legend: !primaryName && investments.length > 1 ? { data: investments.map((inv) => inv.name), top: 0 } : undefined,
    series: investments.map((inv, i) => ({
      name: inv.name,
      type: 'line',
      smooth: true,
      color: COLORS[i % COLORS.length],
      areaStyle: inv.name === primaryName ? { opacity: 0.2 } : undefined,
      lineStyle: primaryName && inv.name !== primaryName ? { opacity: 0 } : undefined,
      showSymbol: !primaryName || inv.name === primaryName,
      data: inv.data.map((row) => [row.year, row.value]),
    })),
  };

  return (
    <div className="mt-4">
      <ReactECharts option={option} style={{ height: 300, width: '100%' }} />
    </div>
  );
}