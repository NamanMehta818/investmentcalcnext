type YearSelectProps = { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; minYear?: number; disabled?: boolean; };

export default function YearSelect({ value, onChange, placeholder, minYear, disabled }: YearSelectProps) {
  const start = minYear ? minYear + 1 : 2000;
  const years = [];
  for (let y = start; y <= 2075; y++) {
    years.push(y);
  }
  const listId = `years-${placeholder.replace(/\s+/g, '-')}`;

  return (
    <>
      <input list={listId}
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <datalist id={listId}>
        {years.map((y) => (
          <option key={y} value={y} />
        ))}
      </datalist>
    </>
  );
}