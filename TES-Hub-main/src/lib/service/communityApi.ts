import type Comment from "@/types/comment";
import axiosInstance from "../api/apiClient";

export interface NewComment {
  contentId: string;
  body: string;
  authorId?: string;
  parentId?: string;
}

export const createComment = (payload: NewComment) =>
  axiosInstance.post<Comment>("/comments", payload).then((r) => r.data);

export const likeComment = (id: string) =>
  axiosInstance.post<Comment>(`/comments/${id}/like`).then((r) => r.data);

type PostKind = "story" | "question";
type Metric = "like" | "save";

const collectionOf = (kind: PostKind) =>
  kind === "story" ? "stories" : "questions";

export const setEngagement = (
  kind: PostKind,
  slug: string,
  metric: Metric,
  undo = false,
) =>
  axiosInstance
    .post(`/${collectionOf(kind)}/${slug}/${metric}`, null, {
      params: undo ? { undo: "true" } : undefined,
    })
    .then((r) => r.data);
