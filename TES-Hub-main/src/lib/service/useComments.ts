import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/apiClient";
import type Comment from "@/types/comment";
import { createComment, likeComment } from "./communityApi";

const useComments = (contentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(Boolean(contentId));
  const [isPosting, setPosting] = useState(false);

  useEffect(() => {
    if (!contentId) return;

    axiosInstance
      .get<Comment[]>("/comments", { params: { contentId } })
      .then((res) => setComments(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load comments.",
        ),
      )
      .finally(() => setLoading(false));
  }, [contentId]);

  const addComment = useCallback(
    async (body: string, authorId?: string, parentId?: string) => {
      if (!body.trim() || !contentId) return null;

      setPosting(true);
      try {
        const comment = await createComment({
          contentId,
          body,
          authorId,
          parentId,
        });
        setComments((prev) => [...prev, comment]);
        return comment;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to post your comment.",
        );
        return null;
      } finally {
        setPosting(false);
      }
    },
    [contentId],
  );

  const like = useCallback(async (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)),
    );
    try {
      await likeComment(id);
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, likes: Math.max(0, c.likes - 1) } : c,
        ),
      );
    }
  }, []);

  const visible = comments.filter((c) => !c.isHidden);

  return { comments: visible, error, isLoading, isPosting, addComment, like };
};

export default useComments;
