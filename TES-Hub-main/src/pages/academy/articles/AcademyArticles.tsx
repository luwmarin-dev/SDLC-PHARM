import SearchInput from "@/components/ui/searchInput";
import useArticles from "@/lib/hooks/useArticles";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

const PAGE_SIZE = 6;

const AcademyArticles = () => {
  const { t } = useTranslation();
  const { published, error, isLoading } = useArticles();

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const [tab, setTab] = useState<"latest" | "popular">("latest");

  const filtered = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();
    const list = (published ?? []).filter(
      (a) =>
        a.title.toLocaleLowerCase().includes(query) &&
        (!tagFilter || a.topicTags.includes(tagFilter)),
    );

    return [...list].sort((a, b) =>
      tab === "popular"
        ? b.stats.likes - a.stats.likes || b.stats.views - a.stats.views
        : new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime(),
    );
  }, [published, search, tab, tagFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const trending = useMemo(() => {
    const counts = new Map<string, number>();
    (published ?? []).forEach((a) =>
      a.topicTags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [published]);

  const navigate = useNavigate();

  function formatStatus(status: string): string {
    return status
      .replace(/-/g, " ")
      .replace(/^./, (char) => char.toUpperCase());
  }

  function toHashtag(tag: string): string {
    return (
      "#" +
      tag
        .split("-")
        .map((part) => part.replace(/^./, (c) => c.toUpperCase()))
        .join("")
    );
  }

  function formatNumbers(n: number) {
    if (n >= 1000) {
      return n / 1000 + "k";
    }
    return n;
  }

  if (error)
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-5">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("articles.errorOccurred", { error })}
        </h1>
      </div>
    );

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div>
            <h1 className="text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
              {t("articles.title")}
            </h1>
            <h3 className="mt-3">{t("articles.subtitle")}</h3>
          </div>
          <div className="w-full md:w-auto md:min-w-70">
            <SearchInput
              onChange={(e) => {
                setSearch(e);
                setPage(1);
              }}
              placeholder={t("articles.searchPlaceholder")}
            />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[75%]">
            <div className="flex gap-6 items-start border-b w-full border-[#C1C8C2]">
              <button
                onClick={() => {
                  setTab("latest");
                  setPage(1);
                }}
                className={`${tab === "latest" ? "text-[#012D1D] border-b-3 border-[#012D1D] " : "text-[#414844] border-none"} text-sm font-semibold pb-1 cursor-pointer`}
              >
                {t("articles.latest")}
              </button>
              <button
                onClick={() => {
                  setTab("popular");
                  setPage(1);
                }}
                className={`${tab === "popular" ? "text-[#012D1D] border-b-3 border-[#012D1D] " : "text-[#414844] border-none"} text-sm font-semibold pb-1 cursor-pointer`}
              >
                {t("articles.popular")}
              </button>
            </div>

            {tagFilter && (
              <button
                onClick={() => {
                  setTagFilter(null);
                  setPage(1);
                }}
                className="mt-4 text-[#012D1D] bg-[#F2F4F2] py-1 px-3 rounded-full text-sm cursor-pointer"
              >
                {toHashtag(tagFilter)} ✕
              </button>
            )}

            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-[#C1C8C2] mt-6 animate-pulse"
                >
                  <div className="bg-[#c1c8c280] h-7 w-2/3 rounded-xs" />
                  <div className="bg-[#c1c8c280] h-4 w-full rounded-xs mt-3" />
                  <div className="bg-[#c1c8c280] h-50 w-full rounded-sm mt-4" />
                </div>
              ))}

            {!isLoading && pageItems.length === 0 && (
              <p className="text-[#414844] mt-6">{t("articles.empty")}</p>
            )}

            {!isLoading &&
              pageItems.map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/academy/articles/${article.slug}`)}
                  className="p-6 rounded-xl border border-[#C1C8C2] mt-6 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h2 className="text-[#012D1D] text-2xl font-semibold">
                    {article.title}
                  </h2>
                  <p className="text-[#414844] mt-2">{article.excerpt}</p>
                  {article.coverImage && (
                    <div className="bg-[#ECEEEC] py-4 rounded-sm mt-2">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mt-2">
                    {article.topicTags.map((t) => (
                      <span
                        key={t}
                        className="text-[#191C1B] bg-[#F2F4F2] py-1 px-3 rounded-full"
                      >
                        {formatStatus(t)}
                      </span>
                    ))}
                  </div>

                  <div className="h-px w-full bg-[#C1C8C2] my-2"></div>

                  <div className="w-full mt-4 flex items-center justify-between">
                    <div className="flex gap-6 items-center">
                      <div className="flex items-center gap-1 text-[#414844] text-sm">
                        <ThumbsUp size={18} />
                        {formatNumbers(article.stats.likes)}
                      </div>
                      <div className="flex items-center gap-1 text-[#414844] text-sm">
                        <MessageSquare size={18} />
                        <p>
                          {t("articles.commentCount", {
                            count: formatNumbers(article.stats.comments),
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={t("articles.saveArticle")}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    >
                      <Bookmark size={20} color="#414844" />
                    </button>
                  </div>
                </div>
              ))}

            {!isLoading && pageCount > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-sm text-sm ${
                      n === currentPage
                        ? "bg-[#012D1D] text-white"
                        : "border border-[#C1C8C2] text-[#414844]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          <aside className="w-full lg:w-[25%]">
            <div className="p-6 rounded-xl border border-[#C1C8C2] mt-6">
              <h3 className="text-2xl text-[#012D1D] font-semibold">
                {t("articles.trendingTopics")}
              </h3>

              {trending.length === 0 && (
                <p className="text-[#414844] text-sm mt-4">
                  {t("articles.noTopics")}
                </p>
              )}

              {trending.map(({ tag, count }) => (
                <div key={tag} className="mt-4">
                  <p
                    onClick={() => {
                      setTagFilter(tagFilter === tag ? null : tag);
                      setPage(1);
                    }}
                    className={`text-sm font-semibold hover:underline cursor-pointer ${
                      tagFilter === tag ? "text-[#012D1D]" : "text-[#191C1B]"
                    }`}
                  >
                    {toHashtag(tag)}
                  </p>
                  <p className="text-[#414844] text-xs">
                    {t("community.widgets.postCount", { count })}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AcademyArticles;
