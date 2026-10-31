import SearchInput from "@/components/ui/searchInput";
import useCommunityFeed, { type FeedSort } from "@/lib/hooks/useCommunityFeed";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FeedTabs from "../components/FeedTabs";
import PostList from "../components/PostList";
import {
  GuidelinesWidget,
  RegionsWidget,
  TopicsWidget,
} from "../components/SidebarWidgets";

const SORT_VALUES: FeedSort[] = ["latest", "popular"];

const Stories = () => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<FeedSort>("latest");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const { posts, topics, regions, isLoading, error } = useCommunityFeed({
    kind: "story",
    sort,
    search,
    tag,
  });

  const sortTabs = SORT_VALUES.map((value) => ({
    value,
    label: t(`community.sort.${value}`),
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
            {t("community.stories.title")}
          </h1>
          <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
            {t("community.stories.subtitle")}
          </p>
        </div>
        <div className="w-full lg:w-90">
          <SearchInput
            onChange={setSearch}
            placeholder={t("community.stories.searchPlaceholder")}
          />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        <div className="w-full lg:w-[70%]">
          <FeedTabs tabs={sortTabs} value={sort} onChange={setSort} />

          {tag && (
            <button
              type="button"
              onClick={() => setTag(null)}
              className="mt-4 text-xs text-[#012D1D] bg-[#E7F6E4] py-1.5 px-3 rounded-full cursor-pointer"
            >
              {tag} ✕
            </button>
          )}

          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            emptyMessage={t("community.stories.empty")}
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

export default Stories;
