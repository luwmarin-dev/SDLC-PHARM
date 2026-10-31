import { Search } from "lucide-react";

interface Props {
  onChange: (e: string) => void;
  placeholder: string;
  className?: string;
}

const SearchInput = ({ onChange, placeholder, className }: Props) => {
  return (
    <div className="border border-[#C1C8C2] p-4 px-6 flex items-center gap-3 bg-[#F2F4F2] rounded-xl">
      <input
        type="text"
        className={`outline-none w-full placeholder:text-[#6B7280] placeholder:text-base text-[#191C1B] text-lg ${className}`}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <Search color="#414844" className="cursor-pointer" />
    </div>
  );
};

export default SearchInput;
