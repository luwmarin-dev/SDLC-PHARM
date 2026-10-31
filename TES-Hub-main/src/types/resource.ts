import type { Category } from "./category";
import type Region from "./region";

export const RESOURCE_TYPES = [
  "guide",
  "template",
  "dataset",
  "toolkit",
  "video",
  "link",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export default interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  category: Category;
  language: "ru" | "ky" | "en";
  fileUrl?: string;
  fileName?: string;
  sizeKb?: number;
  externalUrl?: string;
  updatedAt: string;
  downloadCount: number;
  tags: string[];
  region?: Region;
  requiresAuth: boolean;
  isFeatured?: boolean;
}
