import { ThumbsUp } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import ProfileBadge from "./profileBadge";
import useComments from "@/lib/service/useComments";
import { useUser } from "@/lib/hooks/useUser";
import type CommentType from "@/types/comment";

const CommentRow = ({ comment }: { comment: CommentType }) => {
  const { t } = useTranslation();
  const { user } = useUser(comment.authorId);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const initials = (user?.displayName ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="flex gap-4 py-5 border-b border-[#C1C8C2] last:border-b-0">
      {user?.avatar && !avatarFailed ? (
        <img
          src={user.avatar}
          alt={user.displayName}
          onError={() => setAvatarFailed(true)}
          className="w-10 h-10 shrink-0 object-cover rounded-lg bg-[#ECEEEC]"
        />
      ) : (
        <div className="w-10 h-10 shrink-0 rounded-lg bg-[#ECEEEC] text-[#414844] text-sm font-semibold flex items-center justify-center">
          {initials}
        </div>
      )}
      <div className="w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-[#191C1B] text-sm font-semibold">
            {user?.displayName ?? t("comments.unknownAuthor")}
          </h4>
          {comment.isExpertAnswer && <ProfileBadge role={user?.role} />}
          <span className="text-[#414844] text-xs">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-[#414844] text-sm mt-2">{comment.body}</p>
        <div className="flex items-center gap-1 text-[#414844] text-xs mt-3">
          <ThumbsUp size={14} />
          {comment.likes}
        </div>
      </div>
    </div>
  );
};

const Comments = ({ contentId }: { contentId: string }) => {
  const { t } = useTranslation();
  const { comments, error, isLoading } = useComments(contentId);

  return (
    <section className="mt-12">
      <h2 className="text-[#012D1D] text-2xl font-semibold">
        {isLoading || error
          ? t("comments.title")
          : t("comments.titleWithCount", { count: comments.length })}
      </h2>

      <div className="mt-2">
        {isLoading && (
          <p className="text-[#414844] text-sm py-5">{t("common.loading")}</p>
        )}

        {!isLoading && error && (
          <p className="text-[#414844] text-sm py-5">{error}</p>
        )}

        {!isLoading && !error && comments.length === 0 && (
          <p className="text-[#414844] text-sm py-5">{t("comments.empty")}</p>
        )}

        {!isLoading &&
          !error &&
          comments.map((c) => <CommentRow key={c.id} comment={c} />)}
      </div>
    </section>
  );
};

export default Comments;
