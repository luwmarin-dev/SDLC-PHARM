import SearchInput from "@/components/ui/searchInput";
import useCommunityFeed, {
  isQuestion,
  type FeedSort,
} from "@/lib/hooks/useCommunityFeed";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FeedTabs from "../components/FeedTabs";
import PostList from "../components/PostList";
import { GuidelinesWidget, TopicsWidget } from "../components/SidebarWidgets";

const SORT_VALUES: FeedSort[] = ["latest", "popular", "unanswered"];

type Filter = "all" | "open" | "solved";

const Questions = () => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<FeedSort>("latest");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const { posts, topics, isLoading, error } = useCommunityFeed({
    kind: "question",
    sort,
    search,
    tag,
  });

  const visible = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter(
      (p) => isQuestion(p) && p.isSolved === (filter === "solved"),
    );
  }, [posts, filter]);

  const openCount = posts.filter((p) => isQuestion(p) && !p.isSolved).length;

  const sortTabs = SORT_VALUES.map((value) => ({
    value,
    label:
      value === "unanswered"
        ? t("community.questions.sortUnanswered")
        : t(`community.sort.${value}`),
  }));

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
            {t("community.questions.title")}
          </h1>
          <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
            {t("community.questions.subtitle")}
          </p>
          <p className="text-[#414844] text-sm mt-3">
            {t("community.questions.openCount", { count: openCount })}
          </p>
        </div>
        <div className="w-full lg:w-90">
          <SearchInput
            onChange={setSearch}
            placeholder={t("community.questions.searchPlaceholder")}
          />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        <div className="w-full lg:w-[70%]">
          <FeedTabs tabs={sortTabs} value={sort} onChange={setSort} />

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {(["all", "open", "solved"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
                  filter === f
                    ? "bg-[#012D1D] text-white"
                    : "bg-[#F2F4F2] text-[#414844] hover:bg-[#E4E9E4]"
                }`}
              >
                {t(`community.questions.filter.${f}`)}
              </button>
            ))}

            {tag && (
              <button
                type="button"
                onClick={() => setTag(null)}
                className="text-xs text-[#012D1D] bg-[#E7F6E4] py-1.5 px-3 rounded-full cursor-pointer"
              >
                {tag} ✕
              </button>
            )}
          </div>

          <PostList
            posts={visible}
            isLoading={isLoading}
            error={error}
            emptyMessage={t("community.questions.empty")}
          />
        </div>

        <aside className="w-full lg:w-[30%] flex flex-col gap-6">
          <TopicsWidget
            topics={topics}
            activeTag={tag}
            onSelect={(t) => setTag(tag === t ? null : t)}
          />
          <GuidelinesWidget />
        </aside>
      </div>
    </div>
  );
};

export default Questions;
