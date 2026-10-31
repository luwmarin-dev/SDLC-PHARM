import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const SettingsCard = ({ title, description, children, footer }: Props) => (
  <section className="border border-[#C1C8C2] rounded-xl bg-white p-6 md:p-8">
    <header className="mb-6">
      <h2 className="text-[#012D1D] text-xl md:text-2xl font-semibold">
        {title}
      </h2>
      {description && (
        <p className="text-[#414844] text-sm mt-2">{description}</p>
      )}
    </header>

    {children}

    {footer && (
      <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-4">
        {footer}
      </div>
    )}
  </section>
);

export default SettingsCard;
