export default interface postsPublished {
  id: number;
  title: string;
  date: Date;
  message: string;
  type: "comment" | "post";
}
