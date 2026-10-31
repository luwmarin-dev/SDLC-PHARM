import type BaseContent from "./base-content";

export interface StoryAuthor {
  name: string;
  avatar?: string;
  isVerified: boolean;
}

export default interface Story extends BaseContent {
  type: "story";
  body: string;
  excerpt: string;
  surface: "community";
  isVerifiedByTES: boolean;
  isPremium: boolean;
  author: StoryAuthor;
}
