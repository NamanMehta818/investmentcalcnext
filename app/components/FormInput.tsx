type FormInputProps = { label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; };

export default function FormInput({ label, type, value, onChange, placeholder }: FormInputProps) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1">{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="border border-gray-300 rounded px-3 py-2 w-full" />
    </div>
  );
}