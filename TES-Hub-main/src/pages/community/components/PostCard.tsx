import { useUser } from "@/lib/hooks/useUser";
import { isQuestion, type CommunityPost } from "@/lib/hooks/useCommunityFeed";
import { formatCount, formatTag, regionLabel } from "@/lib/utils/community";
import {
  BadgeCheck,
  CheckCircle2,
  Eye,
  HelpCircle,
  Lock,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import PostImage from "./PostImage";

interface Props {
  post: CommunityPost;
}

const plainText = (html: string) => html.replace(/<[^>]*>/g, " ");

const PostCard = ({ post }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser(post.authorId);

  const question = isQuestion(post);
  const href = question
    ? `/community/questions/${post.slug}`
    : `/community/stories/${post.slug}`;

  const authorName =
    user?.displayName ??
    (question ? t("community.post.communityMember") : post.author.name);
  const authorAvatar =
    user?.avatar ?? (question ? undefined : post.author.avatar);
  const isVerified = question
    ? user?.role === "verified_farmer" || user?.role === "spac_consultant"
    : post.author.isVerified;

  const summary = question
    ? plainText(post.body).slice(0, 220)
    : post.excerpt || plainText(post.body).slice(0, 220);

  return (
    <article
      onClick={() => navigate(href)}
      className="p-6 rounded-xl border border-[#C1C8C2] bg-white hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={authorName} src={authorAvatar} size={40} />
          <div>
            <div className="flex items-center gap-1 text-[#191C1B] text-sm font-semibold min-w-0">
              <span className="truncate">{authorName}</span>
              {isVerified && (
                <BadgeCheck size={15} className="text-[#1F6D1A] shrink-0" />
              )}
            </div>
            <p className="text-[#414844] text-xs">
              {moment(post.publishedAt ?? post.createdAt).fromNow()}
              {post.region?.oblast && ` • ${regionLabel(post.region)}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {question ? (
            post.isSolved ? (
              <span className="flex items-center gap-1 text-[#267320] bg-[#E7F6E4] text-xs font-semibold py-1 px-2 rounded-full">
                <CheckCircle2 size={12} /> {t("community.post.solved")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#1E3A8A] bg-[#DBEAFE] text-xs font-semibold py-1 px-2 rounded-full">
                <HelpCircle size={12} /> {t("community.post.question")}
              </span>
            )
          ) : (
            <>
              {post.isVerifiedByTES && (
                <span className="flex items-center gap-1 text-[#267320] bg-[#E7F6E4] text-xs font-semibold py-1 px-2 rounded-full">
                  <BadgeCheck size={12} /> {t("community.post.tesVerified")}
                </span>
              )}
              {post.isPremium && (
                <span className="flex items-center gap-1 text-[#B45309] bg-[#FEF3E2] text-xs font-semibold py-1 px-2 rounded-full">
                  <Lock size={12} /> {t("community.post.premium")}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <h2 className="text-[#012D1D] text-xl font-semibold mt-4">
        {post.title}
      </h2>
      <p className="text-[#414844] text-sm mt-2 line-clamp-3">{summary}</p>

      {!question && (
        <PostImage
          src={post.coverImage}
          alt={post.title}
          className="w-full h-52 object-cover rounded-lg mt-4"
        />
      )}

      <div className="flex gap-2 flex-wrap mt-4">
        {post.topicTags.slice(0, 4).map((tag) => (
          <Link
            key={tag}
            to={`/community/topics/${tag}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[#191C1B] bg-[#F2F4F2] hover:bg-[#E4E9E4] text-xs py-1 px-3 rounded-full"
          >
            {formatTag(tag)}
          </Link>
        ))}
      </div>

      <div className="h-px w-full bg-[#E1E3E1] my-4" />

      <div className="flex items-center gap-6 text-[#414844] text-sm">
        <span className="flex items-center gap-1">
          <ThumbsUp size={16} /> {formatCount(post.stats.likes)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={16} />
          {formatCount(question ? post.answerCount : post.stats.comments)}
          {question
            ? ` ${t("community.post.answers")}`
            : ` ${t("community.post.comments")}`}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={16} /> {formatCount(post.stats.views)}
        </span>
      </div>
    </article>
  );
};

export default PostCard;
