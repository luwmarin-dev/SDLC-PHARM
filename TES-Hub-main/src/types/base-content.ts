import type Region from "./region";

export default interface BaseContent {
  id: string;
  type: "article" | "story" | "question" | "course" | "session";
  slug: string;
  title: string;
  authorId: string;
  status: "draft" | "pending_review" | "published" | "rejected" | "archived";
  visibility: "public" | "unlisted" | "private" | "hidden";
  language: "ru" | "ky" | "en";
  topicTags: string[];
  region?: Region;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  rejectionReason?: string;
  stats: { views: number; likes: number; comments: number; saves: number };
}
