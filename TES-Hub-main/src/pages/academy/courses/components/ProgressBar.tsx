interface Props {
  percent: number;
  className?: string;
  tone?: "light" | "dark";
}

const ProgressBar = ({ percent, className = "", tone = "dark" }: Props) => {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  const track = tone === "light" ? "bg-[#FFFFFF33]" : "bg-[#E1E6E1]";
  const fill = tone === "light" ? "bg-[#A4F792]" : "bg-[#1F6D1A]";

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full rounded-full overflow-hidden ${track} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
