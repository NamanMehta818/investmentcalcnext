'use client';

import ReactECharts from 'echarts-for-react';
import { SavedInvestment } from '../type/types';

type LineChartProps = { investments: SavedInvestment[] };

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];

export default function LineChart({ investments }: LineChartProps) {
  const summaryTitles = investments.map((inv, i) => {
    const finalValue = inv.data[inv.data.length - 1]?.value ?? 0;
    return {
      text: `${inv.name}: $${finalValue.toFixed(2)}`,
      left: 10,
      top: 55 + i * 20,
      textStyle: { fontSize: 12, fontWeight: 'bold', color: COLORS[i % COLORS.length] },
    };
  });

  const option = {
    title: investments.length > 1 ? summaryTitles : undefined,
    grid: { top: investments.length > 1 ? 55 + investments.length * 20 + 10 : 40, left: 50, right: 20, bottom: 40 },
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
          lines += `${p.marker} ${p.seriesName}: $${value.toFixed(2)}<br/>`;
        });
        if (params.length > 1) {
          lines += `<strong>Total: $${total.toFixed(2)}</strong>`;
        }
        return lines;
      },
    },
    legend: investments.length > 1 ? { data: investments.map((inv) => inv.name), top: 0 } : undefined,
    series: investments.map((inv, i) => ({
      name: inv.name,
      type: 'line',
      smooth: true,
      color: COLORS[i % COLORS.length],
      areaStyle: { opacity: 0.2 },
      data: inv.data.map((row) => [row.year, row.value]),
    })),
  };

  return (
    <div className="mt-4">
      <ReactECharts option={option} style={{ height: 300, width: '100%' }} />
    </div>
  );
}