import useCommunityFeed, { type FeedSort } from "@/lib/hooks/useCommunityFeed";
import { oblastFromSlug } from "@/lib/utils/community";
import { ChevronLeft, MapPin } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import FeedTabs from "../components/FeedTabs";
import PostList from "../components/PostList";
import { RegionsWidget, TopicsWidget } from "../components/SidebarWidgets";

const SORT_VALUES: FeedSort[] = ["latest", "popular", "unanswered"];

const RegionalFeed = () => {
  const { t } = useTranslation();
  const { regionSlug: slug = "" } = useParams();
  const [sort, setSort] = useState<FeedSort>("latest");

  const {
    posts: allPosts,
    topics,
    regions,
    isLoading,
    error,
  } = useCommunityFeed({ sort });

  const oblast = oblastFromSlug(
    slug,
    regions.map((r) => r.oblast),
  );
  const posts = allPosts.filter((p) => p.region?.oblast === oblast);

  const sortTabs = SORT_VALUES.map((value) => ({
    value,
    label: t(`community.sort.${value}`),
  }));

  if (!isLoading && !oblast) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("community.region.noFeedTitle")}
        </h1>
        <p className="text-[#414844] mt-2">
          {t("community.region.noFeedText")}
        </p>
        <Link
          to="/community"
          className="inline-block border border-[#717973] mt-6 text-[#191C1B] py-2 px-5 text-sm rounded-xs hover:shadow"
        >
          {t("community.region.backToCommunity")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-[#414844] text-sm hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} /> {t("community.back")}
      </Link>

      <header className="mt-4">
        <h1 className="flex items-center gap-3 text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
          <MapPin size={32} className="shrink-0" />
          {t("ui.oblast", { name: oblast })}
        </h1>
        <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
          {t("community.region.subtitle")}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        <div className="w-full lg:w-[70%]">
          <FeedTabs tabs={sortTabs} value={sort} onChange={setSort} />
          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            emptyMessage={t("community.region.empty")}
          />
        </div>

        <aside className="w-full lg:w-[30%] flex flex-col gap-6">
          <RegionsWidget regions={regions} limit={10} />
          <TopicsWidget topics={topics} />
        </aside>
      </div>
    </div>
  );
};

export default RegionalFeed;
