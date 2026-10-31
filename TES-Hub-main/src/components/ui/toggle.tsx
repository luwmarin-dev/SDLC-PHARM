interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

const Toggle = ({ checked, onChange, label, description, disabled }: Props) => (
  <label
    className={`flex items-start justify-between gap-4 py-4 ${
      disabled ? "opacity-50" : "cursor-pointer"
    }`}
  >
    <span>
      <span className="block text-[#191C1B] font-medium">{label}</span>
      {description && (
        <span className="block text-[#6B7280] text-sm mt-1">{description}</span>
      )}
    </span>

    <span className="relative shrink-0 mt-1">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="block w-11 h-6 rounded-full bg-[#C1C8C2] transition-colors peer-checked:bg-[#012D1D] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#012D1D]" />
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);

export default Toggle;
