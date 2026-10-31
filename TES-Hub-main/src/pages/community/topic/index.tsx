import SearchInput from "@/components/ui/searchInput";
import useCommunityFeed from "@/lib/hooks/useCommunityFeed";
import { formatTag, toHashtag } from "@/lib/utils/community";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Topics = () => {
  const { t } = useTranslation();
  const { topics, all, isLoading, error } = useCommunityFeed();
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();
    if (!query) return topics;
    return topics.filter((t) => t.tag.toLocaleLowerCase().includes(query));
  }, [topics, search]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-[#414844] text-sm hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} /> {t("community.back")}
      </Link>

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mt-4">
        <div>
          <h1 className="text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t("community.topics.title")}
          </h1>
          <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
            {t("community.topics.subtitle", { count: all.length })}
          </p>
        </div>
        <div className="w-full lg:w-90">
          <SearchInput
            onChange={setSearch}
            placeholder={t("community.topics.searchPlaceholder")}
          />
        </div>
      </header>

      {error && (
        <p className="text-[#C1292E] mt-8">
          {t("community.topics.loadError", { error })}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-[#C1C8C2] bg-white animate-pulse"
            >
              <div className="bg-[#c1c8c280] h-5 w-2/3 rounded-xs" />
              <div className="bg-[#c1c8c280] h-3 w-1/3 rounded-xs mt-3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && visible.length === 0 && (
        <p className="text-[#414844] mt-10">
          {t("community.topics.noMatches")}
        </p>
      )}

      {!isLoading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {visible.map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/community/topics/${tag}`}
              className="p-6 rounded-xl border border-[#C1C8C2] bg-white hover:shadow-lg transition-all"
            >
              <h2 className="text-[#012D1D] text-lg font-semibold">
                {toHashtag(tag)}
              </h2>
              <p className="text-[#414844] text-sm mt-1">{formatTag(tag)}</p>
              <p className="text-[#717973] text-xs mt-3">
                {t("community.widgets.postCount", { count })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Topics;
