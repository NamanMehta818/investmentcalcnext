type FormInputProps = { label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; min?: number; required?: boolean; };

export default function FormInput({ label, type, value, onChange, placeholder, min, required }: FormInputProps) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 text-gray-900 dark:text-gray-100">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={(e) => { if (e.target.value !== '') e.target.reportValidity(); }}
        placeholder={placeholder}
        min={min}
        required={required}
        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
      />
    </div>
  );
}