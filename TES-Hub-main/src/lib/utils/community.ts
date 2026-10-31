import type Region from "@/types/region";

export const formatTag = (tag: string) =>
  tag.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

export const toHashtag = (tag: string) =>
  "#" +
  tag
    .split("-")
    .map((part) => part.replace(/^./, (c) => c.toUpperCase()))
    .join("");

export const toTagSlug = (value: string) =>
  value
    .replace(/^#/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

export const formatCount = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

export const initialsOf = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const regionLabel = (region?: Region) => {
  if (!region) return "";
  const parts = [region.village, region.raion, region.oblast].filter(
    (part): part is string => Boolean(part),
  );
  return [...new Set(parts)].join(", ");
};

export const regionSlug = (oblast: string) =>
  oblast.trim().toLowerCase().replace(/\s+/g, "-");

export const oblastFromSlug = (slug: string, known: string[]) =>
  known.find((o) => regionSlug(o) === slug.toLowerCase()) ?? null;

export const toRichText = (body: string) => {
  if (/<[a-z][\s\S]*>/i.test(body)) return body;
  return body
    .split(/\n{2,}/)
    .map((block) => `<p>${block.trim()}</p>`)
    .join("");
};

export const LANGUAGE_LABELS: Record<string, string> = {
  ru: "Russian",
  ky: "Kyrgyz",
  en: "English",
};
