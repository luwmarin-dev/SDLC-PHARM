interface Tab<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const FeedTabs = <T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: Props<T>) => (
  <div
    className={`flex gap-6 items-start border-b border-[#C1C8C2] ${className}`}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        aria-current={tab.value === value ? "true" : undefined}
        className={`text-sm font-semibold pb-1 cursor-pointer ${
          tab.value === value
            ? "text-[#012D1D] border-b-3 border-[#012D1D]"
            : "text-[#414844] border-none"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default FeedTabs;
