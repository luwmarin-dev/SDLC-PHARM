import useAuth from "@/lib/hooks/useAuth";
import { useUser } from "@/lib/hooks/useUser";
import sanitize from "@/lib/sanitize";
import useStory from "@/lib/service/useStory";
import { formatTag, regionLabel, toRichText } from "@/lib/utils/community";
import { BadgeCheck, ChevronLeft, Lock, MapPin } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import Discussion from "../components/Discussion";
import PostActions from "../components/PostActions";
import PostImage from "../components/PostImage";
import styles from "../components/styles.module.css";

const PREMIUM_ROLES = [
  "verified_farmer",
  "spac_consultant",
  "tes_author",
  "tes_admin",
];

const StoriesDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const { story, error, isLoading } = useStory(slug ?? "");
  const { user: author } = useUser(story?.authorId ?? "");
  const viewer = useAuth();

  const [following, setFollowing] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12 animate-pulse">
        <div className="bg-[#c1c8c280] h-4 w-48 rounded-xs" />
        <div className="bg-[#c1c8c280] h-12 w-3/4 rounded-xs my-6" />
        <div className="bg-[#c1c8c280] h-5 w-full rounded-xs" />
        <div className="bg-[#c1c8c280] h-80 w-full rounded-lg mt-8" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("community.story.notFound")}
        </h1>
        <p className="text-[#414844] mt-2">
          {error ?? t("community.story.notFoundText")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/community/stories")}
          className="border border-[#717973] mt-6 text-[#191C1B] py-2 px-5 text-sm rounded-xs cursor-pointer hover:shadow"
        >
          {t("community.story.backToStories")}
        </button>
      </div>
    );
  }

  const locked =
    story.isPremium && !PREMIUM_ROLES.includes(viewer?.role ?? "guest");

  const authorName = author?.displayName ?? story.author.name;
  const isVerified = author
    ? author.role === "verified_farmer" || author.role === "spac_consultant"
    : story.author.isVerified;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <Link
        to="/community/stories"
        className="inline-flex items-center gap-1 text-[#414844] text-sm hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} /> {t("community.story.fieldStories")}
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        <article className="w-full lg:w-[70%] border border-[#C1C8C2] bg-white rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {story.isVerifiedByTES && (
              <span className="flex items-center gap-1 text-[#267320] bg-[#E7F6E4] font-semibold py-1 px-2 rounded-full">
                <BadgeCheck size={13} /> {t("community.post.tesVerified")}
              </span>
            )}
            {story.isPremium && (
              <span className="flex items-center gap-1 text-[#B45309] bg-[#FEF3E2] font-semibold py-1 px-2 rounded-full">
                <Lock size={12} /> {t("community.post.premium")}
              </span>
            )}
            <span className="text-[#414844]">
              {t("community.story.posted", {
                time: moment(story.publishedAt ?? story.createdAt).fromNow(),
              })}
            </span>
            {story.region?.oblast && (
              <span className="flex items-center gap-1 text-[#414844] ml-auto">
                <MapPin size={13} /> {regionLabel(story.region)}
              </span>
            )}
          </div>

          <h1 className="text-[#012D1D] text-3xl sm:text-4xl font-bold mt-5">
            {story.title}
          </h1>

          <div className="flex items-center justify-between gap-4 mt-6">
            <Link
              to={
                author?.username
                  ? `/community/author/${author.username}`
                  : `/profile/${story.authorId}`
              }
              className="flex items-center gap-3 group"
            >
              <Avatar
                name={authorName}
                src={author?.avatar ?? story.author.avatar}
                size={44}
              />
              <span>
                <span className="flex items-center gap-1 text-[#191C1B] font-semibold text-sm group-hover:underline">
                  {authorName}
                  {isVerified && (
                    <BadgeCheck size={15} className="text-[#1F6D1A]" />
                  )}
                </span>
                <span className="block text-[#414844] text-xs">
                  {author?.bio?.split(".")[0] ??
                    t("community.story.contributor")}
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setFollowing((f) => !f)}
              className={`text-sm font-semibold py-1.5 px-4 rounded-lg cursor-pointer transition-colors ${
                following
                  ? "bg-[#E7F6E4] text-[#267320]"
                  : "border border-[#1F6D1A] text-[#1F6D1A] hover:bg-[#F2F7F2]"
              }`}
            >
              {following
                ? t("community.author.following")
                : t("community.author.follow")}
            </button>
          </div>

          <PostImage
            src={story.coverImage}
            alt={story.title}
            caption={story.excerpt}
            className="w-full max-h-100 object-cover rounded-lg"
          />

          {locked ? (
            <div className="mt-8">
              <div
                className={`${styles.post_body} max-h-60 overflow-hidden relative`}
                dangerouslySetInnerHTML={{
                  __html: sanitize(toRichText(story.body)),
                }}
              />
              <div className="border border-[#C1C8C2] bg-[#F9FAF9] rounded-xl p-8 -mt-16 relative flex flex-col items-center text-center">
                <div className="p-4 bg-[#FFDCC3] rounded-xl">
                  <Lock color="#3E1E00" />
                </div>
                <h2 className="text-[#191C1B] text-2xl font-semibold mt-4">
                  {t("community.story.lockedTitle")}
                </h2>
                <p className="text-[#414844] text-sm mt-2 max-w-md">
                  {t("community.story.lockedText")}
                </p>
                <Link
                  to="/settings"
                  className="bg-[#012D1D] text-white text-sm font-semibold py-2 px-5 rounded-lg mt-5 hover:bg-[#013d27] transition-colors"
                >
                  {t("community.story.getVerified")}
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={styles.post_body}
              dangerouslySetInnerHTML={{
                __html: sanitize(toRichText(story.body)),
              }}
            />
          )}

          <div className="flex gap-2 flex-wrap mt-8">
            {story.topicTags.map((tag) => (
              <Link
                key={tag}
                to={`/community/topics/${tag}`}
                className="text-[#191C1B] bg-[#F2F4F2] hover:bg-[#E4E9E4] text-xs py-1 px-3 rounded-full"
              >
                {formatTag(tag)}
              </Link>
            ))}
          </div>

          <PostActions
            post={story}
            className="border-t border-[#E1E3E1] mt-6 pt-4"
            onCommentClick={() =>
              document
                .getElementById("discussion")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </article>

        <aside className="w-full lg:w-[30%]" id="discussion">
          <Discussion contentId={story.id} className="lg:sticky lg:top-28" />
        </aside>
      </div>
    </div>
  );
};

export default StoriesDetail;
