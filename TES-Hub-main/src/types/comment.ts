export default interface Comment {
  id: string;
  contentId: string;
  parentId?: string;
  authorId: string;
  body: string;
  createdAt: string;
  likes: number;
  isHidden: boolean;
  isAcceptedAnswer?: boolean;
  isExpertAnswer?: boolean;
}
