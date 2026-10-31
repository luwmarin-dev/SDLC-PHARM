export default interface Badge {
  id: string;
  type:
    | "verified_farmer"
    | "spac_consultant"
    | "tes_expert"
    | "top_author"
    | "early_adopter";
  awardedAt: string;
}
