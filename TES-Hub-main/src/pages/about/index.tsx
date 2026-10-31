import {
  BookOpen,
  CalendarRange,
  HandHeart,
  Languages,
  Leaf,
  MessageSquare,
  ShieldCheck,
  Sprout,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import StyledContainer from "../../components/layout/StyledContainer";
import Button from "../../components/ui/button";

const PILLARS: { key: string; icon: LucideIcon; to: string }[] = [
  { key: "academy", icon: BookOpen, to: "/academy" },
  { key: "community", icon: MessageSquare, to: "/community" },
  { key: "sessions", icon: CalendarRange, to: "/sessions" },
];

const VALUES: { key: string; icon: LucideIcon }[] = [
  { key: "practical", icon: Sprout },
  { key: "local", icon: Languages },
  { key: "trusted", icon: ShieldCheck },
  { key: "together", icon: HandHeart },
];

const MILESTONES = ["1999", "2008", "2016", "2024"] as const;

const IMPACT = [
  { key: "farmers", value: "25k+" },
  { key: "articles", value: "500+" },
  { key: "sessions", value: "1.2k+" },
  { key: "regions", value: "9" },
] as const;

const About = () => {
  const { t } = useTranslation();

  return (
    <div>
      <section className="bg-[#1B4332]">
        <StyledContainer className="py-16 md:py-24">
          <p className="text-[#86AF99] text-sm tracking-[0.2em] uppercase">
            {t("about.eyebrow")}
          </p>
          <h1 className="text-white font-bold text-4xl md:text-6xl mt-4 max-w-3xl">
            {t("about.title")}
          </h1>
          <p className="text-[#D6E5DC] text-lg mt-6 max-w-2xl">
            {t("about.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              to="/academy"
              className="font-semibold py-3 px-7 rounded-xl text-base bg-white text-[#012D1D] transition active:scale-95"
            >
              {t("home.hero.browseAcademy")}
            </Link>
            <Link
              to="/contact"
              className="font-semibold py-3 px-7 rounded-xl text-base border-2 border-white text-white hover:bg-white/10 transition active:scale-95"
            >
              {t("footer.contact")}
            </Link>
          </div>
        </StyledContainer>
      </section>

      <StyledContainer className="py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-start">
          <div>
            <h2 className="text-[#012D1D] font-bold text-3xl md:text-4xl">
              {t("about.mission.title")}
            </h2>
            <p className="text-[#414844] text-base md:text-lg mt-5 leading-8">
              {t("about.mission.paragraph1")}
            </p>
            <p className="text-[#414844] text-base md:text-lg mt-4 leading-8">
              {t("about.mission.paragraph2")}
            </p>
          </div>

          <div className="border border-[#C1C8C2] rounded-xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#E7F0EA] text-[#1B4332]">
                <Leaf size={22} />
              </div>
              <h3 className="text-[#012D1D] text-xl font-semibold">
                {t("about.impact.title")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8">
              {IMPACT.map((item) => (
                <div key={item.key}>
                  <p className="text-[#1B4332] text-3xl font-bold">
                    {item.value}
                  </p>
                  <p className="text-[#6B7280] text-sm mt-1">
                    {t(`about.impact.${item.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StyledContainer>

      <section className="bg-[#F4F6F5] border-y border-[#E2E8F0]">
        <StyledContainer className="py-16 md:py-20">
          <h2 className="text-[#012D1D] font-bold text-3xl md:text-4xl">
            {t("about.pillars.title")}
          </h2>
          <p className="text-[#414844] text-base md:text-lg mt-3 max-w-2xl">
            {t("about.pillars.subtitle")}
          </p>

          <div className="grid gap-6 mt-10 md:grid-cols-3">
            {PILLARS.map(({ key, icon: Icon, to }) => (
              <Link
                key={key}
                to={to}
                className="border border-[#C1C8C2] rounded-xl bg-white p-6 md:p-8 transition hover:border-[#012D1D] hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-[#E7F0EA] text-[#1B4332] w-max">
                  <Icon size={22} />
                </div>
                <h3 className="text-[#012D1D] text-xl font-semibold mt-5">
                  {t(`about.pillars.${key}Title`)}
                </h3>
                <p className="text-[#414844] text-sm leading-6 mt-3">
                  {t(`about.pillars.${key}Text`)}
                </p>
              </Link>
            ))}
          </div>
        </StyledContainer>
      </section>

      <StyledContainer className="py-16 md:py-20">
        <h2 className="text-[#012D1D] font-bold text-3xl md:text-4xl">
          {t("about.story.title")}
        </h2>

        <ol className="mt-10 border-l-2 border-[#C1C8C2] pl-6 md:pl-8 flex flex-col gap-10">
          {MILESTONES.map((year) => (
            <li key={year} className="relative">
              <span className="absolute -left-[35px] md:-left-[43px] top-1 w-4 h-4 rounded-full bg-[#1B4332] border-4 border-white ring-1 ring-[#C1C8C2]" />
              <p className="text-[#1F6D1A] font-semibold">{year}</p>
              <h3 className="text-[#012D1D] text-lg font-semibold mt-1">
                {t(`about.story.${year}Title`)}
              </h3>
              <p className="text-[#414844] text-sm leading-6 mt-2 max-w-2xl">
                {t(`about.story.${year}Text`)}
              </p>
            </li>
          ))}
        </ol>
      </StyledContainer>

      <section className="bg-[#F4F6F5] border-y border-[#E2E8F0]">
        <StyledContainer className="py-16 md:py-20">
          <h2 className="text-[#012D1D] font-bold text-3xl md:text-4xl">
            {t("about.values.title")}
          </h2>

          <div className="grid gap-6 mt-10 sm:grid-cols-2">
            {VALUES.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex gap-4 border border-[#C1C8C2] rounded-xl bg-white p-6"
              >
                <div className="p-3 rounded-xl bg-[#E7F0EA] text-[#1B4332] h-max">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-[#012D1D] text-lg font-semibold">
                    {t(`about.values.${key}Title`)}
                  </h3>
                  <p className="text-[#414844] text-sm leading-6 mt-2">
                    {t(`about.values.${key}Text`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </StyledContainer>
      </section>

      <StyledContainer className="py-16 md:py-20">
        <div className="border border-[#C1C8C2] rounded-2xl bg-white p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Users size={22} className="text-[#1B4332]" />
              <h2 className="text-[#012D1D] font-bold text-2xl md:text-3xl">
                {t("about.cta.title")}
              </h2>
            </div>
            <p className="text-[#414844] text-base mt-4">
              {t("about.cta.text")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/auth">
              <Button>{t("common.signUp")}</Button>
            </Link>
            <Link to="/community">
              <Button variant="outline">{t("footer.community")}</Button>
            </Link>
          </div>
        </div>
      </StyledContainer>
    </div>
  );
};

export default About;
