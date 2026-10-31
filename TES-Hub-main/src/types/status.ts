export type EntityStatus =
  "archived" | "published" | "draft" | "pending_review" | "rejected";

export interface Status {
  status: EntityStatus;
}

const status = ["archived", "published", "draft", "pending_review", "rejected"];

export default status;
