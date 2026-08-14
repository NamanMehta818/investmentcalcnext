'use client';

import ReactECharts from 'echarts-for-react';
import { SavedInvestment } from '../type/types';

type LineChartProps = { investments: SavedInvestment[] };

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];

export default function LineChart({ investments }: LineChartProps) {
  const option = {
    xAxis: { type: 'value', name: 'Year', min: 'dataMin', max: 'dataMax' },
    yAxis: { type: 'value', name: 'Value' },
    tooltip: { trigger: 'axis' },
    legend: investments.length > 1 ? { data: investments.map((inv) => inv.name), top: 0 } : undefined,
    series: investments.map((inv, i) => ({
      name: inv.name,
      type: 'line',
      smooth: true,
      color: COLORS[i % COLORS.length],
      data: inv.data.map((row) => [row.year, row.value]),
    })),
  };

  return (
    <div className="mt-4">
      <ReactECharts option={option} style={{ height: 300, width: '100%' }} />
    </div>
  );
}