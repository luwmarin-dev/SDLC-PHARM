import { setEngagement } from "@/lib/service/communityApi";
import { formatCount } from "@/lib/utils/community";
import type { CommunityPost } from "@/lib/hooks/useCommunityFeed";
import { Bookmark, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  post: CommunityPost;
  onCommentClick?: () => void;
  className?: string;
}

const PostActions = ({ post, onCommentClick, className = "" }: Props) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.stats.likes);
  const [copied, setCopied] = useState(false);

  const toggle = async (metric: "like" | "save") => {
    const wasOn = metric === "like" ? liked : saved;

    if (metric === "like") {
      setLiked(!wasOn);
      setLikes((n) => Math.max(0, n + (wasOn ? -1 : 1)));
    } else {
      setSaved(!wasOn);
    }

    try {
      await setEngagement(
        post.type as "story" | "question",
        post.slug,
        metric,
        wasOn,
      );
    } catch {
      if (metric === "like") {
        setLiked(wasOn);
        setLikes((n) => Math.max(0, n + (wasOn ? 1 : -1)));
      } else {
        setSaved(wasOn);
      }
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const button =
    "flex items-center gap-2 text-sm cursor-pointer transition-colors hover:text-[#012D1D]";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => toggle("like")}
          aria-pressed={liked}
          className={`${button} ${liked ? "text-[#1F6D1A] font-semibold" : "text-[#414844]"}`}
        >
          <ThumbsUp size={18} fill={liked ? "currentColor" : "none"} />
          {formatCount(likes)}
        </button>

        <button
          type="button"
          onClick={onCommentClick}
          className={`${button} text-[#414844]`}
        >
          <MessageSquare size={18} />
          {formatCount(post.stats.comments)} {t("community.actions.comments")}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => toggle("save")}
          aria-pressed={saved}
          className={`${button} ${saved ? "text-[#012D1D] font-semibold" : "text-[#414844]"}`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          {saved ? t("community.actions.saved") : t("community.actions.save")}
        </button>

        <button
          type="button"
          onClick={share}
          className={`${button} text-[#414844]`}
        >
          <Share2 size={18} />
          {copied
            ? t("community.actions.linkCopied")
            : t("community.actions.share")}
        </button>
      </div>
    </div>
  );
};

export default PostActions;
