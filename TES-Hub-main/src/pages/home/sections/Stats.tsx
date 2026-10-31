import { useTranslation } from "react-i18next";

const stats = [
  { number: 25000, key: "farmers" },
  { number: 500, key: "articles" },
  { number: 1200, key: "sessions" },
] as const;

const formatNumber = (n: number) => {
  if (n % 1000 === 0) return `${n / 1000}k`;
  return n.toLocaleString();
};

const Stats = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#1B4332]">
      <div className="container mx-auto grid grid-cols-1 divide-y divide-[#86af9933] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div
            key={s.key}
            className="flex flex-col items-center gap-2 px-8 py-12 text-center"
          >
            <p className="text-3xl font-semibold text-[#A5D0B9] sm:text-4xl">
              {formatNumber(s.number)}+
            </p>
            <p className="text-sm tracking-[0.2em] text-[#86AF99] uppercase">
              {t(`home.stats.${s.key}`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
