export const ROLES = [
  "guest",
  "member",
  "verified_farmer",
  "spac_consultant",
  "tes_author",
  "tes_admin",
] as const;

export type Role = (typeof ROLES)[number];
