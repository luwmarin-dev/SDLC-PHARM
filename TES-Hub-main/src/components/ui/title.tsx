import { useId } from "react";

interface Props {
  label: string;
  value: string;
  setValue: (title: string) => void;
  placeholder: string;
  error?: string;
}

const Title = ({ label, value, setValue, placeholder, error }: Props) => {
  const id = useId();

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-[#191C1B] text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        className={`p-3 py-2 outline-none border-2 mt-2 bg-white rounded-xs ${
          error ? "border-red-500" : "border-[#717973]"
        }`}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      {error && <span className="mt-2 text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Title;
