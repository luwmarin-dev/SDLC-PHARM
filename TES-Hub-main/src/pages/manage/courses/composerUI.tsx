import { Check } from "lucide-react";
import type { ReactNode } from "react";

export const inputClass =
  "w-full border border-[#C1C8C2] rounded-md px-3 h-11 text-sm outline-none bg-white focus:border-[#012D1D]";

export const Field = ({
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) => (
  <label className={`block ${className}`}>
    <span className="text-[#191C1B] text-sm font-semibold">
      {label}
      {required && <span className="text-[#BA1A1A]"> *</span>}
    </span>
    <div className="mt-2">{children}</div>
    {error ? (
      <span className="mt-1 text-red-500 text-xs block">{error}</span>
    ) : (
      hint && <span className="mt-1 text-[#6B7280] text-xs block">{hint}</span>
    )}
  </label>
);

export const Card = ({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={`border border-[#C1C8C2] rounded-xl bg-white p-6 ${className}`}
  >
    {title && <h2 className="text-[#012D1D] text-xl font-semibold">{title}</h2>}
    {description && (
      <p className="text-[#414844] text-sm mt-1">{description}</p>
    )}
    <div className={title ? "mt-5" : ""}>{children}</div>
  </section>
);

export interface StepDef {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  current: number;
  furthest: number;
  onSelect: (index: number) => void;
}

export const Stepper = ({
  steps,
  current,
  furthest,
  onSelect,
}: StepperProps) => (
  <ol className="flex items-start justify-between gap-2 mt-8">
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;
      const reachable = i <= furthest;

      return (
        <li key={step.key} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            <span
              className={`h-0.5 flex-1 ${
                i === 0
                  ? "bg-transparent"
                  : i <= current
                    ? "bg-[#267320]"
                    : "bg-[#E5E7EB]"
              }`}
            />
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onSelect(i)}
              aria-current={active ? "step" : undefined}
              className={`h-8 w-8 shrink-0 rounded-full text-sm font-semibold flex items-center justify-center transition-colors ${
                done
                  ? "bg-[#267320] text-white"
                  : active
                    ? "bg-[#012D1D] text-white"
                    : "bg-[#E6E9E7] text-[#6B7280]"
              } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              {done ? <Check size={16} /> : i + 1}
            </button>
            <span
              className={`h-0.5 flex-1 ${
                i === steps.length - 1
                  ? "bg-transparent"
                  : i < current
                    ? "bg-[#267320]"
                    : "bg-[#E5E7EB]"
              }`}
            />
          </div>
          <span
            className={`mt-2 text-xs text-center ${
              active
                ? "text-[#012D1D] font-semibold"
                : done
                  ? "text-[#267320] font-medium"
                  : "text-[#6B7280]"
            }`}
          >
            {step.label}
          </span>
        </li>
      );
    })}
  </ol>
);
