import type BaseContent from "./base-content";
import type { Category } from "./category";
import type Pricing from "./pricing";

export default interface Article extends BaseContent {
  type: "article";
  category: Category;
  body: string;
  excerpt: string;
  readTimeMinutes: number;
  pricing: Pricing;
  surface: "academy";
  isVerifiedByTES: true;
}
