import SearchInput from "@/components/ui/searchInput";
import useCommunityFeed, { type FeedSort } from "@/lib/hooks/useCommunityFeed";
import usePermissions from "@/lib/hooks/usePermissions";
import { formatCount } from "@/lib/utils/community";
import { HelpCircle, Images, PenLine, Tags } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FeedTabs from "./components/FeedTabs";
import PostList from "./components/PostList";
import {
  GuidelinesWidget,
  RegionsWidget,
  TopicsWidget,
} from "./components/SidebarWidgets";

type Kind = "all" | "story" | "question";

const KIND_VALUES: Kind[] = ["all", "story", "question"];
const SORT_VALUES: FeedSort[] = ["latest", "popular", "unanswered"];

const Community = () => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<Kind>("all");
  const [sort, setSort] = useState<FeedSort>("latest");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const { posts, all, topics, regions, isLoading, error } = useCommunityFeed({
    kind,
    sort,
    search,
    tag,
  });

  const { can } = usePermissions();

  const storyCount = all.filter((p) => p.type === "story").length;
  const questionCount = all.filter((p) => p.type === "question").length;

  const kindTabs = KIND_VALUES.map((value) => ({
    value,
    label: t(`community.kind.${value}`),
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h1 className="text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t("community.title")}
          </h1>
          <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
            {t("community.subtitle")}
          </p>
          <p className="text-[#414844] text-sm mt-3">
            {t("community.counts", {
              stories: formatCount(storyCount),
              questions: formatCount(questionCount),
            })}
          </p>
        </div>

        <div className="w-full lg:w-90">
          <SearchInput
            onChange={setSearch}
            placeholder={t("community.searchPlaceholder")}
          />
        </div>
      </header>

      <nav className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link
          to="/community/questions"
          className="flex items-center gap-3 p-4 rounded-xl border border-[#C1C8C2] bg-white hover:shadow-lg transition-all"
        >
          <HelpCircle size={20} className="text-[#012D1D]" />
          <span>
            <span className="block text-[#191C1B] font-semibold text-sm">
              {t("community.askTitle")}
            </span>
            <span className="block text-[#414844] text-xs">
              {t("community.askText")}
            </span>
          </span>
        </Link>
        <Link
          to="/community/photos"
          className="flex items-center gap-3 p-4 rounded-xl border border-[#C1C8C2] bg-white hover:shadow-lg transition-all"
        >
          <Images size={20} className="text-[#012D1D]" />
          <span>
            <span className="block text-[#191C1B] font-semibold text-sm">
              {t("community.photoTitle")}
            </span>
            <span className="block text-[#414844] text-xs">
              {t("community.photoText")}
            </span>
          </span>
        </Link>
        <Link
          to="/community/topics"
          className="flex items-center gap-3 p-4 rounded-xl border border-[#C1C8C2] bg-white hover:shadow-lg transition-all"
        >
          <Tags size={20} className="text-[#012D1D]" />
          <span>
            <span className="block text-[#191C1B] font-semibold text-sm">
              {t("community.topicsTitle")}
            </span>
            <span className="block text-[#414844] text-xs">
              {t("community.topicsText")}
            </span>
          </span>
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        <div className="w-full lg:w-[70%]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FeedTabs tabs={kindTabs} value={kind} onChange={setKind} />
            {can("createStory") && (
              <Link
                to="/community/stories"
                className="flex items-center gap-2 bg-[#012D1D] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#013d27] transition-colors"
              >
                <PenLine size={16} /> {t("community.shareStory")}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {SORT_VALUES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
                  sort === s
                    ? "bg-[#012D1D] text-white"
                    : "bg-[#F2F4F2] text-[#414844] hover:bg-[#E4E9E4]"
                }`}
              >
                {t(`community.sort.${s}`)}
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
            posts={posts}
            isLoading={isLoading}
            error={error}
            emptyMessage={t("community.emptyFeed")}
          />
        </div>

        <aside className="w-full lg:w-[30%] flex flex-col gap-6">
          <TopicsWidget
            topics={topics}
            activeTag={tag}
            onSelect={(t) => setTag(tag === t ? null : t)}
          />
          <RegionsWidget regions={regions} />
          <GuidelinesWidget />
        </aside>
      </div>
    </div>
  );
};

export default Community;
