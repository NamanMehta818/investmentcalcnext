import { YearlyResult } from '../type/types';

type ResultsTableProps = { data: YearlyResult[] };

export default function ResultsTable({ data }: ResultsTableProps) {
  return (
    <table className="w-full mt-4 border-collapse text-gray-900 dark:text-gray-100">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700">
          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Year</th>
          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.year} className="bg-white dark:bg-gray-800">
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">{row.year}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">${row.value.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}