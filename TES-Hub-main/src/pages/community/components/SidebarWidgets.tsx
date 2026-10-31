import { formatCount, regionSlug, toHashtag } from "@/lib/utils/community";
import { MapPin, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const card = "p-6 rounded-xl border border-[#C1C8C2] bg-white";

interface TopicsProps {
  topics: { tag: string; count: number }[];
  limit?: number;
  activeTag?: string | null;
  onSelect?: (tag: string) => void;
}

export const TopicsWidget = ({
  topics,
  limit = 6,
  activeTag = null,
  onSelect,
}: TopicsProps) => {
  const { t } = useTranslation();

  return (
    <div className={card}>
      <h3 className="flex items-center gap-2 text-[#012D1D] font-semibold">
        <TrendingUp size={18} /> {t("community.widgets.trendingTopics")}
      </h3>

      {topics.length === 0 && (
        <p className="text-[#414844] text-sm mt-4">
          {t("community.widgets.noTopics")}
        </p>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {topics.slice(0, limit).map(({ tag, count }) => {
          const label = (
            <>
              <span
                className={`text-sm font-semibold ${
                  activeTag === tag ? "text-[#012D1D]" : "text-[#191C1B]"
                }`}
              >
                {toHashtag(tag)}
              </span>
              <span className="block text-[#414844] text-xs">
                {t("community.widgets.postCount", { count })}
              </span>
            </>
          );

          return onSelect ? (
            <button
              key={tag}
              type="button"
              onClick={() => onSelect(tag)}
              className="text-left cursor-pointer hover:opacity-70"
            >
              {label}
            </button>
          ) : (
            <Link
              key={tag}
              to={`/community/topics/${tag}`}
              className="hover:opacity-70"
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Link
        to="/community/topics"
        className="inline-block text-[#012D1D] text-sm font-semibold mt-5 underline"
      >
        {t("community.widgets.browseTopics")}
      </Link>
    </div>
  );
};

interface RegionsProps {
  regions: { oblast: string; count: number }[];
  limit?: number;
}

export const RegionsWidget = ({ regions, limit = 6 }: RegionsProps) => {
  const { t } = useTranslation();

  return (
    <div className={card}>
      <h3 className="flex items-center gap-2 text-[#012D1D] font-semibold">
        <MapPin size={18} /> {t("community.widgets.regionalFeeds")}
      </h3>

      {regions.length === 0 && (
        <p className="text-[#414844] text-sm mt-4">
          {t("community.widgets.noRegions")}
        </p>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {regions.slice(0, limit).map(({ oblast, count }) => (
          <Link
            key={oblast}
            to={`/community/region/${regionSlug(oblast)}`}
            className="flex items-center justify-between text-sm hover:opacity-70"
          >
            <span className="text-[#191C1B]">
              {t("ui.oblast", { name: oblast })}
            </span>
            <span className="text-[#414844] text-xs bg-[#F2F4F2] py-0.5 px-2 rounded-full">
              {formatCount(count)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

interface GuidelinesProps {
  className?: string;
}

export const GuidelinesWidget = ({ className = "" }: GuidelinesProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${card} ${className}`}>
      <h3 className="text-[#012D1D] font-semibold">
        {t("community.widgets.guidelines")}
      </h3>
      <ul className="text-[#414844] text-sm mt-4 flex flex-col gap-2 list-disc pl-4">
        <li>{t("community.widgets.guideline1")}</li>
        <li>{t("community.widgets.guideline2")}</li>
        <li>{t("community.widgets.guideline3")}</li>
        <li>{t("community.widgets.guideline4")}</li>
      </ul>
    </div>
  );
};
