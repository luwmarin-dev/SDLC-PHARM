export default interface Notification {
  id: string;
  userId: string;
  type: "content" | "social" | "commerce" | "system";
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
