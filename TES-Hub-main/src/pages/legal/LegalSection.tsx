import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SectionProps {
  index: number;
  title: string;
  children: ReactNode;
}

export const Section = ({ index, title, children }: SectionProps) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-[#012D1D] font-bold text-2xl">
      {index}. {title}
    </h2>
    {children}
  </section>
);

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <p className="text-[#414844] text-sm leading-6">{children}</p>
);

export const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="flex flex-col gap-2 pl-6">
    {items.map((item, i) => (
      <li key={i} className="text-[#414844] text-sm leading-6 list-disc">
        {item}
      </li>
    ))}
  </ul>
);

interface CalloutProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

export const Callout = ({ icon: Icon, title, children }: CalloutProps) => (
  <div className="p-5 border-2 border-[#C1C8C2] rounded-lg bg-[#F8FAF8]">
    <h3 className="flex items-center gap-2 text-[#012D1D] font-bold text-lg">
      <Icon size={20} className="text-[#1B4332]" />
      {title}
    </h3>
    <p className="text-[#414844] text-sm leading-6 mt-3">{children}</p>
  </div>
);

export const SubHeading = ({ children }: { children: ReactNode }) => (
  <h4 className="text-[#191C1B] text-xs font-semibold tracking-wide uppercase">
    {children}
  </h4>
);
