import useAuth from "@/lib/hooks/useAuth";
import usePermissions from "@/lib/hooks/usePermissions";
import { useUser } from "@/lib/hooks/useUser";
import useComments from "@/lib/service/useComments";
import { formatCount } from "@/lib/utils/community";
import type CommentType from "@/types/comment";
import {
  BadgeCheck,
  CheckCircle2,
  Leaf,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

interface Props {
  contentId: string;
  title?: string;
  variant?: "comments" | "answers";
  className?: string;
}

const RoleChip = ({ role }: { role?: string }) => {
  const { t } = useTranslation();

  if (role === "verified_farmer") {
    return (
      <span className="flex items-center gap-1 text-[#267320] bg-[#E7F6E4] text-[10px] font-semibold py-0.5 px-1.5 rounded-full">
        <Leaf size={10} /> {t("community.discussion.verified")}
      </span>
    );
  }
  if (
    role === "spac_consultant" ||
    role === "tes_author" ||
    role === "tes_admin"
  ) {
    return (
      <span className="flex items-center gap-1 text-[#1E3A8A] bg-[#DBEAFE] text-[10px] font-semibold py-0.5 px-1.5 rounded-full">
        <BadgeCheck size={10} /> {t("community.discussion.expert")}
      </span>
    );
  }
  return null;
};

interface RowProps {
  comment: CommentType;
  replies: CommentType[];
  onLike: (id: string) => void;
  onReply: (comment: CommentType) => void;
  isReply?: boolean;
}

const CommentRow = ({
  comment,
  replies,
  onLike,
  onReply,
  isReply = false,
}: RowProps) => {
  const { t } = useTranslation();
  const { user } = useUser(comment.authorId);

  return (
    <div className={isReply ? "mt-3 pl-4 border-l-2 border-[#E1E3E1]" : "mt-4"}>
      <div
        className={`rounded-lg p-3 ${
          comment.isAcceptedAnswer
            ? "bg-[#E7F6E4] border border-[#A4F792]"
            : "bg-[#F6F8F6]"
        }`}
      >
        <div className="flex items-start gap-2">
          <Avatar name={user?.displayName} src={user?.avatar} size={28} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#191C1B] text-xs font-semibold">
                {user?.displayName ?? t("community.post.communityMember")}
              </span>
              <RoleChip role={user?.role} />
              <span className="text-[#717973] text-[10px] ml-auto shrink-0">
                {moment(comment.createdAt).fromNow(true)}
              </span>
            </div>

            {comment.isAcceptedAnswer && (
              <p className="flex items-center gap-1 text-[#267320] text-[10px] font-semibold mt-1">
                <CheckCircle2 size={11} />{" "}
                {t("community.discussion.acceptedAnswer")}
              </p>
            )}

            <p className="text-[#414844] text-xs leading-relaxed mt-1.5 break-words">
              {comment.body}
            </p>

            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => onLike(comment.id)}
                className="flex items-center gap-1 text-[#717973] text-[11px] cursor-pointer hover:text-[#012D1D]"
              >
                <ThumbsUp size={12} /> {formatCount(comment.likes)}
              </button>
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="text-[#717973] text-[11px] cursor-pointer hover:text-[#012D1D]"
              >
                {t("community.discussion.reply")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {replies.map((reply) => (
        <CommentRow
          key={reply.id}
          comment={reply}
          replies={[]}
          onLike={onLike}
          onReply={onReply}
          isReply
        />
      ))}
    </div>
  );
};

const Discussion = ({
  contentId,
  title,
  variant = "comments",
  className = "",
}: Props) => {
  const { t } = useTranslation();
  const { comments, error, isLoading, isPosting, addComment, like } =
    useComments(contentId);
  const auth = useAuth();
  const { can } = usePermissions();

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<CommentType | null>(null);

  const { roots, repliesOf } = useMemo(() => {
    const repliesOf = new Map<string, CommentType[]>();
    comments.forEach((c) => {
      if (!c.parentId) return;
      repliesOf.set(c.parentId, [...(repliesOf.get(c.parentId) ?? []), c]);
    });

    const roots = comments
      .filter((c) => !c.parentId)
      .sort((a, b) => {
        if (variant === "answers") {
          if (a.isAcceptedAnswer !== b.isAcceptedAnswer) {
            return a.isAcceptedAnswer ? -1 : 1;
          }
          if (a.likes !== b.likes) return b.likes - a.likes;
        }
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

    return { roots, repliesOf };
  }, [comments, variant]);

  const isAnswers = variant === "answers";
  const heading = title ?? t("community.discussion.title");

  const submit = async () => {
    if (!draft.trim()) return;
    const posted = await addComment(draft, auth?.id, replyTo?.id);
    if (posted) {
      setDraft("");
      setReplyTo(null);
    }
  };

  return (
    <section
      className={`border border-[#C1C8C2] bg-white rounded-xl p-5 ${className}`}
    >
      <h2 className="flex items-center gap-2 text-[#012D1D] font-semibold">
        <MessageSquare size={18} />
        {isLoading || error
          ? heading
          : t("community.discussion.titleWithCount", {
              title: heading,
              count: comments.length,
            })}
      </h2>

      {can("comment") ? (
        <div className="mt-4">
          {replyTo && (
            <p className="text-[#414844] text-xs mb-2">
              {isAnswers
                ? t("community.discussion.replyingAnswer")
                : t("community.discussion.replyingComment")}{" "}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[#012D1D] underline cursor-pointer"
              >
                {t("common.cancel")}
              </button>
            </p>
          )}
          <div className="flex gap-2">
            <Avatar name={auth?.displayName} src={auth?.avatar} size={28} />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={
                isAnswers
                  ? t("community.discussion.placeholderAnswer")
                  : t("community.discussion.placeholderComment")
              }
              className="w-full text-xs text-[#191C1B] placeholder:text-[#8A928C] bg-[#F6F8F6] border border-[#E1E3E1] rounded-lg p-2.5 outline-none focus:border-[#717973] resize-y"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || isPosting}
            className="mt-2 w-full bg-[#012D1D] text-white text-xs font-semibold py-2 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-default hover:bg-[#013d27] transition-colors"
          >
            {isPosting
              ? t("community.discussion.posting")
              : isAnswers
                ? t("community.discussion.postAnswer")
                : t("community.discussion.postComment")}
          </button>
        </div>
      ) : (
        <p className="text-[#414844] text-xs bg-[#F6F8F6] border border-[#E1E3E1] rounded-lg p-3 mt-4">
          <Link to="/auth" className="text-[#012D1D] font-semibold underline">
            {t("community.discussion.signInPrefix")}
          </Link>{" "}
          {t("community.discussion.signInSuffix")}
        </p>
      )}

      <div className="mt-2">
        {isLoading && (
          <p className="text-[#414844] text-xs py-4">
            {t("community.discussion.loading")}
          </p>
        )}

        {!isLoading && error && (
          <p className="text-[#C1292E] text-xs py-4">{error}</p>
        )}

        {!isLoading && !error && roots.length === 0 && (
          <p className="text-[#414844] text-xs py-4">
            {isAnswers
              ? t("community.discussion.emptyAnswers")
              : t("community.discussion.emptyComments")}
          </p>
        )}

        {!isLoading &&
          !error &&
          roots.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              replies={repliesOf.get(comment.id) ?? []}
              onLike={like}
              onReply={setReplyTo}
            />
          ))}
      </div>
    </section>
  );
};

export default Discussion;
