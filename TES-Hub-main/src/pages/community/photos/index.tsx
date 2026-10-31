import useCommunityFeed, { isStory } from "@/lib/hooks/useCommunityFeed";
import { formatCount, regionLabel } from "@/lib/utils/community";
import type Story from "@/types/story";
import { ChevronLeft, Images, MapPin, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PhotoTile = ({ story }: { story: Story }) => {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Link
      to={`/community/stories/${story.slug}`}
      className="group rounded-xl border border-[#C1C8C2] bg-white overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="overflow-hidden bg-[#ECEEEC]">
        <img
          src={story.coverImage}
          alt={story.title}
          onError={() => setFailed(true)}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h2 className="text-[#191C1B] text-sm font-semibold line-clamp-2">
          {story.title}
        </h2>
        <div className="flex items-center justify-between gap-2 mt-3 text-[#414844] text-xs">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={13} className="shrink-0" />
            {regionLabel(story.region) || t("community.photos.fallbackRegion")}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <ThumbsUp size={13} /> {formatCount(story.stats.likes)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Photos = () => {
  const { t } = useTranslation();
  const { posts, regions, isLoading, error } = useCommunityFeed({
    kind: "story",
  });
  const [oblast, setOblast] = useState<string | null>(null);

  const photos = useMemo(
    () =>
      posts
        .filter((p): p is Story => isStory(p) && Boolean(p.coverImage))
        .filter((p) => !oblast || p.region?.oblast === oblast),
    [posts, oblast],
  );

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
          <Images size={32} className="shrink-0" />{" "}
          {t("community.photos.title")}
        </h1>
        <p className="text-[#414844] text-base sm:text-lg mt-3 max-w-2xl">
          {t("community.photos.subtitle")}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mt-8">
        <button
          type="button"
          onClick={() => setOblast(null)}
          className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
            oblast === null
              ? "bg-[#012D1D] text-white"
              : "bg-[#F2F4F2] text-[#414844] hover:bg-[#E4E9E4]"
          }`}
        >
          {t("community.photos.allRegions")}
        </button>
        {regions.map(({ oblast: name }) => (
          <button
            key={name}
            type="button"
            onClick={() => setOblast(oblast === name ? null : name)}
            className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
              oblast === name
                ? "bg-[#012D1D] text-white"
                : "bg-[#F2F4F2] text-[#414844] hover:bg-[#E4E9E4]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-[#C1292E] mt-8">
          {t("community.photos.loadError", { error })}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#C1C8C2] bg-white overflow-hidden animate-pulse"
            >
              <div className="bg-[#c1c8c280] h-56 w-full" />
              <div className="p-4">
                <div className="bg-[#c1c8c280] h-4 w-3/4 rounded-xs" />
                <div className="bg-[#c1c8c280] h-3 w-1/2 rounded-xs mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && photos.length === 0 && (
        <p className="text-[#414844] mt-10">{t("community.photos.empty")}</p>
      )}

      {!isLoading && !error && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {photos.map((story) => (
            <PhotoTile key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Photos;
