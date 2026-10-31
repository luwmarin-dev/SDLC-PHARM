import type BaseContent from "./base-content";
import type { Category } from "./category";
import type CourseSection from "./course-section";
import type Pricing from "./pricing";

export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_PERKS = [
  "lifetime_access",
  "expert_forum",
  "downloadable_resources",
] as const;
export type CoursePerk = (typeof COURSE_PERKS)[number];

export default interface Course extends BaseContent {
  type: "course";
  category: Category;
  visibility: "public" | "unlisted" | "hidden";
  shortDescription: string;
  longDescription: string;
  level: CourseLevel;
  estimatedDurationHours: number;
  sections: CourseSection[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  pricing: Pricing;
  certificateTemplate?: string;
  completionThresholdPercent: number;
  perks?: CoursePerk[];
  enrollmentLimit?: number;
  surface: "academy";
}
