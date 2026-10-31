import type Flag from "../../types/flag";
import type { Role } from "../../types/role";
import { can } from "../../lib/permissions";

const flags: Flag[] = [
  {
    id: "flag-story-spam-pending",
    contentId: "comment-story-hidden-spam",
    contentType: "comment",
    reporterId: "user-verified-farmer-1",
    reason: "spam",
    message: "Promotional link, not related to the story.",
    status: "pending",
    createdAt: "2026-05-22T10:05:00.000Z",
  },
  {
    id: "flag-fertilizer-story-dismissed",
    contentId: "story-miracle-fertilizer-spam",
    contentType: "story",
    reporterId: "user-member-1",
    reason: "misinformation",
    message: "Claims sound exaggerated.",
    status: "dismissed",
    createdAt: "2026-06-18T11:00:00.000Z",
  },
  {
    id: "flag-yield-claims-actioned",
    contentId: "article-unverified-yield-claims-rejected",
    contentType: "article",
    reporterId: "user-tes-author-1",
    reason: "misinformation",
    message: "Unverifiable yield claims, no cited trial data.",
    status: "actioned",
    createdAt: "2026-04-11T08:00:00.000Z",
  },
];

export const getVisibleFlags = (role: Role): Flag[] =>
  can(role, "moderateContent")
    ? flags
    : flags.filter((f) => f.status !== "pending");

export default flags;
