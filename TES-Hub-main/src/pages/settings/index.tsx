import {
  Bell,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import StyledContainer from "../../components/layout/StyledContainer";
import useAuth from "../../lib/hooks/useAuth";
import useSettings from "../../lib/hooks/useSettings";
import AccountSection from "./sections/AccountSection";
import NotificationsSection from "./sections/NotificationsSection";
import PreferencesSection from "./sections/PreferencesSection";
import PrivacySection from "./sections/PrivacySection";
import SecuritySection from "./sections/SecuritySection";

const TABS = [
  { key: "account", icon: UserRound },
  { key: "preferences", icon: SlidersHorizontal },
  { key: "notifications", icon: Bell },
  { key: "privacy", icon: ShieldCheck },
  { key: "security", icon: Lock },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const isTabKey = (value: string | null): value is TabKey =>
  TABS.some((tab) => tab.key === value);

interface TabButtonProps {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const TabButton = ({ active, icon: Icon, label, onClick }: TabButtonProps) => (
  <button
    type="button"
    aria-current={active ? "page" : undefined}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left whitespace-nowrap cursor-pointer transition ${
      active ? "bg-[#012D1D] text-white" : "text-[#414844] hover:bg-[#EEF2EF]"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Settings = () => {
  const { t } = useTranslation();
  const user = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, loading, save } = useSettings(user?.id);

  const param = searchParams.get("tab");
  const activeTab: TabKey = isTabKey(param) ? param : "account";

  const selectTab = (tab: TabKey) =>
    setSearchParams(tab === "account" ? {} : { tab }, { replace: true });

  // PrivateRoutes already redirects anonymous visitors, so this is only a guard
  // for the brief moment before the persisted store rehydrates.
  if (!user) return <div className="p-10">{t("common.loading")}</div>;

  const renderTab = () => {
    if (loading && activeTab !== "account" && activeTab !== "security") {
      return <div className="p-10 text-[#414844]">{t("common.loading")}</div>;
    }

    switch (activeTab) {
      case "preferences":
        return (
          <PreferencesSection user={user} settings={settings} save={save} />
        );
      case "notifications":
        return <NotificationsSection settings={settings} save={save} />;
      case "privacy":
        return <PrivacySection settings={settings} save={save} />;
      case "security":
        return <SecuritySection />;
      default:
        return <AccountSection user={user} />;
    }
  };

  return (
    <StyledContainer className="py-8 md:py-12">
      <header>
        <h1 className="text-[#012D1D] font-bold text-3xl md:text-5xl">
          {t("settings.title")}
        </h1>
        <p className="text-[#414844] text-base md:text-lg mt-3 max-w-2xl">
          {t("settings.subtitle")}
        </p>
        <div className="h-px w-full bg-[#C1C8C2] mt-8" />
      </header>

      <div className="grid gap-6 mt-8 lg:grid-cols-[260px_1fr] items-start">
        <nav
          aria-label={t("settings.title")}
          className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible border border-[#C1C8C2] rounded-xl bg-white p-3"
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              active={activeTab === tab.key}
              icon={tab.icon}
              label={t(`settings.tabs.${tab.key}`)}
              onClick={() => selectTab(tab.key)}
            />
          ))}

          <Link
            to="/profile/me"
            className="hidden lg:block mt-2 px-4 py-3 text-sm text-[#1F6D1A] font-medium hover:underline"
          >
            {t("settings.viewProfile")}
          </Link>
        </nav>

        <div className="min-w-0">{renderTab()}</div>
      </div>
    </StyledContainer>
  );
};

export default Settings;
