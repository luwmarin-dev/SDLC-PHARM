import ProfileBadge from "@/components/ui/profileBadge";
import useCommunityFeed from "@/lib/hooks/useCommunityFeed";
import useAuthor from "@/lib/service/useAuthor";
import {
  formatCount,
  LANGUAGE_LABELS,
  regionLabel,
} from "@/lib/utils/community";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import FeedTabs from "../components/FeedTabs";
import PostList from "../components/PostList";

type Tab = "all" | "story" | "question";

const TAB_VALUES: Tab[] = ["all", "story", "question"];

const AuthorProfile = () => {
  const { t } = useTranslation();
  const { username = "" } = useParams();
  const navigate = useNavigate();

  const { author, error, isLoading } = useAuthor(username);
  const [tab, setTab] = useState<Tab>("all");
  const [following, setFollowing] = useState(false);

  const {
    posts,
    isLoading: feedLoading,
    error: feedError,
  } = useCommunityFeed({ authorId: author?.id ?? null, kind: tab });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12 animate-pulse">
        <div className="bg-[#c1c8c280] h-24 w-24 rounded-full" />
        <div className="bg-[#c1c8c280] h-8 w-64 rounded-xs mt-6" />
        <div className="bg-[#c1c8c280] h-4 w-96 rounded-xs mt-4" />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("community.author.notFound")}
        </h1>
        <p className="text-[#414844] mt-2">
          {error ?? t("community.author.notFoundText")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="border border-[#717973] mt-6 text-[#191C1B] py-2 px-5 text-sm rounded-xs cursor-pointer hover:shadow"
        >
          {t("community.author.backToCommunity")}
        </button>
      </div>
    );
  }

  const stats = [
    { label: t("community.author.posts"), value: posts.length },
    { label: t("community.author.followers"), value: author.stats.followers },
    {
      label: t("community.author.followingCount"),
      value: author.stats.following,
    },
    {
      label: t("community.author.courses"),
      value: author.stats.coursesCompleted.length,
    },
  ];

  const tabs = TAB_VALUES.map((value) => ({
    value,
    label: t(`community.kind.${value}`),
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-[#414844] text-sm hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} /> {t("community.back")}
      </Link>

      <header className="border border-[#C1C8C2] bg-white rounded-xl p-6 sm:p-8 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <Avatar
            name={author.displayName}
            src={author.avatar}
            size={96}
            rounded="lg"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[#012D1D] text-2xl sm:text-3xl font-bold">
                {author.displayName}
              </h1>
              <ProfileBadge role={author.role} />
            </div>
            <p className="text-[#717973] text-sm mt-1">@{author.username}</p>

            {author.bio && (
              <p className="text-[#414844] text-sm mt-4 max-w-2xl">
                {author.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[#414844] text-xs mt-4">
              {author.region && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {regionLabel(author.region)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />{" "}
                {t("community.author.joined", {
                  date: moment(author.createdAt).format("MMMM YYYY"),
                })}
              </span>
              <span>
                {t("community.author.speaks", {
                  languages: author.languages
                    .map((l) => LANGUAGE_LABELS[l] ?? l)
                    .join(", "),
                })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFollowing((f) => !f)}
            className={`w-max h-max text-sm font-semibold py-2 px-5 rounded-lg cursor-pointer transition-colors ${
              following
                ? "bg-[#E7F6E4] text-[#267320]"
                : "bg-[#012D1D] text-white hover:bg-[#013d27]"
            }`}
          >
            {following
              ? t("community.author.following")
              : t("community.author.follow")}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#E1E3E1] mt-6 pt-6">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[#012D1D] text-xl font-bold">
                {formatCount(value)}
              </p>
              <p className="text-[#414844] text-xs">{label}</p>
            </div>
          ))}
        </div>

        {author.badges && author.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-[#E1E3E1] mt-6 pt-6">
            {author.badges.map((badge) => (
              <span
                key={badge.id}
                className="text-[#267320] bg-[#E7F6E4] text-xs font-semibold py-1 px-3 rounded-full capitalize"
              >
                {badge.type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mt-10">
        <FeedTabs tabs={tabs} value={tab} onChange={setTab} />
        <PostList
          posts={posts}
          isLoading={feedLoading}
          error={feedError}
          emptyMessage={t("community.author.empty", {
            name: author.displayName,
          })}
        />
      </div>
    </div>
  );
};

export default AuthorProfile;
