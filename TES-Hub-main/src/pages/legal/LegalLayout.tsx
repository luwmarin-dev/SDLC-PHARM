import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Headset,
  LifeBuoy,
  Mail,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "terms", to: "/terms-of-service", icon: FileText },
  { key: "privacy", to: "/privacy-policy", icon: ShieldCheck },
  { key: "contact", to: "/contact", icon: Mail },
  { key: "help", to: "/contact", icon: LifeBuoy },
] as const;

interface Props {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
  next: { label: string; to: string };
}

const LegalLayout = ({
  title,
  description,
  lastUpdated,
  children,
  next,
}: Props) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-5 px-6 md:px-10">
      <header>
        <h1 className="text-[#012D1D] font-bold text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="text-[#414844] text-lg mt-4 max-w-2xl">{description}</p>
        <div className="h-px w-full bg-[#C1C8C2] mt-8"></div>
      </header>

      <div className="flex flex-col lg:flex-row mt-12 lg:mt-16 gap-6 items-start">
        <aside className="w-full lg:w-[27%] lg:sticky lg:top-24 flex flex-col gap-6">
          <nav className="p-6 border-2 border-[#C1C8C2] rounded-lg bg-white">
            <h2 className="text-[#191C1B] text-sm font-semibold tracking-wide">
              {t("legal.navTitle")}
            </h2>

            <div className="flex flex-col gap-2 mt-4">
              {NAV_ITEMS.map(({ key, to, icon: Icon }) => {
                const isActive = pathname === to;
                return (
                  <Link
                    key={key}
                    to={to}
                    className={`flex items-center gap-2 text-sm py-2 px-3 rounded-sm font-semibold transition-colors ${
                      isActive
                        ? "text-[#86AF99] bg-[#1B4332] hover:brightness-120"
                        : "text-[#414844] hover:bg-[#f8faf8]"
                    }`}
                  >
                    <Icon size={16} />
                    {t(`legal.nav.${key}`)}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-2 border-[#C1C8C2] rounded-lg bg-white text-center">
            <Headset size={24} className="mx-auto text-[#1B4332]" />
            <h3 className="text-[#191C1B] text-sm font-semibold mt-3">
              {t("legal.support.title")}
            </h3>
            <p className="text-[#414844] text-sm mt-2">
              {t("legal.support.text")}
            </p>
            <Link
              to="/contact"
              className="block mt-4 py-2 px-3 rounded-sm bg-[#1B4332] text-white text-sm font-semibold hover:brightness-120 transition"
            >
              {t("legal.support.cta")}
            </Link>
          </div>
        </aside>

        <article className="w-full lg:w-[73%] p-6 md:p-10 border-2 border-[#C1C8C2] rounded-lg bg-white">
          <p className="text-[#414844] text-sm italic">
            {t("legal.lastUpdated", { date: lastUpdated })}
          </p>

          <div className="mt-6 flex flex-col gap-10">{children}</div>

          <div className="h-px w-full bg-[#C1C8C2] mt-12"></div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <p className="text-[#414844] text-sm">{t("legal.endOfDocument")}</p>
            <Link
              to={next.to}
              className="flex items-center gap-2 text-sm font-semibold text-[#1B4332] py-2 px-4 border-2 border-[#1B4332] rounded-sm hover:bg-[#f8faf8] transition-colors"
            >
              {t("legal.next", { label: next.label })}
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default LegalLayout;
