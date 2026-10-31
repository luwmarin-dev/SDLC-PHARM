export default interface Flag {
  id: string;
  contentId: string;
  contentType: "article" | "story" | "question" | "comment";
  reporterId: string;
  reason: "spam" | "misinformation" | "offensive" | "copyright" | "other";
  message?: string;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
}
