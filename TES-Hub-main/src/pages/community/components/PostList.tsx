import type { CommunityPost } from "@/lib/hooks/useCommunityFeed";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PostCard from "./PostCard";

interface Props {
  posts: CommunityPost[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  pageSize?: number;
}

const Skeleton = () => (
  <div className="p-6 rounded-xl border border-[#C1C8C2] bg-white animate-pulse">
    <div className="flex items-center gap-3">
      <div className="bg-[#c1c8c280] w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="bg-[#c1c8c280] h-3 w-40 rounded-xs" />
        <div className="bg-[#c1c8c280] h-3 w-24 rounded-xs mt-2" />
      </div>
    </div>
    <div className="bg-[#c1c8c280] h-6 w-2/3 rounded-xs mt-5" />
    <div className="bg-[#c1c8c280] h-4 w-full rounded-xs mt-3" />
    <div className="bg-[#c1c8c280] h-4 w-4/5 rounded-xs mt-2" />
  </div>
);

const PostList = ({
  posts,
  isLoading = false,
  error = null,
  emptyMessage,
  pageSize = 6,
}: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const [countAtPage, setCountAtPage] = useState(posts.length);
  if (countAtPage !== posts.length) {
    setCountAtPage(posts.length);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = posts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (error) {
    return (
      <p className="text-[#C1292E] mt-6">
        {t("community.list.loadError", { error })}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-[#414844] mt-8">
        {emptyMessage ?? t("community.list.empty")}
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6 mt-6">
        {pageItems.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
          <button
            type="button"
            aria-label={t("community.list.prevPage")}
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={`w-8 h-8 rounded-sm text-sm cursor-pointer ${
                n === currentPage
                  ? "bg-[#012D1D] text-white"
                  : "border border-[#C1C8C2] text-[#414844]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label={t("community.list.nextPage")}
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
            className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;
