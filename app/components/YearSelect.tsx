type YearSelectProps = { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder: string; minYear?: number; };

export default function YearSelect({ value, onChange, placeholder, minYear }: YearSelectProps) {
  const start = minYear ? minYear + 1 : 1950;
  const years = [];
  for (let y = start; y <= 2075; y++) {
    years.push(y);
  }

  return (
    <select value={value} onChange={onChange} className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900">
      <option value="">{placeholder}</option>
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}