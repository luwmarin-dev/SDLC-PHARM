import moment from "moment";
import {
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Lock,
  Package,
  PlayCircle,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import useAuth from "@/lib/hooks/useAuth";
import useResources from "@/lib/hooks/useResources";
import CATEGORIES from "@/types/category";
import { RESOURCE_TYPES, type ResourceType } from "@/types/resource";
import { formatFileSize } from "../academy/courses/components/lessonMeta";

const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  guide: FileText,
  template: FileSpreadsheet,
  dataset: FileSpreadsheet,
  toolkit: Package,
  video: PlayCircle,
  link: ExternalLink,
};

const TYPE_TINTS: Record<ResourceType, string> = {
  guide: "bg-[#E7F3E7] text-[#1F6D1A]",
  template: "bg-[#E4F0FF] text-[#1B4E86]",
  dataset: "bg-[#FFEFE1] text-[#8A4A00]",
  toolkit: "bg-[#F1E7FF] text-[#5B2E9E]",
  video: "bg-[#FFE4E9] text-[#9E2E4A]",
  link: "bg-[#E9ECEA] text-[#414844]",
};

const LANGUAGES = ["ru", "ky", "en"] as const;
const SORTS = ["newest", "popular", "title"] as const;
type Sort = (typeof SORTS)[number];

const SORT_LABEL_KEYS: Record<Sort, string> = {
  newest: "resources.sortNewest",
  popular: "resources.sortPopular",
  title: "resources.sortTitle",
};

const selectClass =
  "rounded-lg border border-[#C1C8C2] bg-white px-3 py-2 text-sm text-[#191C1B] outline-none focus:border-[#1F6D1A] cursor-pointer";

const Resources = () => {
  const { t, i18n } = useTranslation();
  const user = useAuth();
  const { resources, isLoading, error, registerDownload } = useResources();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const hasFilters =
    search.trim() !== "" ||
    type !== "all" ||
    category !== "all" ||
    language !== "all";

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const filtered = resources.filter((resource) => {
      if (type !== "all" && resource.type !== type) return false;
      if (category !== "all" && resource.category !== category) return false;
      if (language !== "all" && resource.language !== language) return false;
      if (!needle) return true;

      return (
        resource.title.toLowerCase().includes(needle) ||
        resource.description.toLowerCase().includes(needle) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "popular") return b.downloadCount - a.downloadCount;
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [resources, search, type, category, language, sort]);

  const featured = resources.filter((resource) => resource.isFeatured);

  const clearFilters = () => {
    setSearch("");
    setType("all");
    setCategory("all");
    setLanguage("all");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#191C1B]">
          {t("resources.loadError")}
        </h1>
        <p className="mt-2 text-[#414844]">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#012D1D]">
          {t("resources.title")}
        </h1>
        <p className="mt-4 text-[#414844]">{t("resources.subtitle")}</p>
      </header>

      {!isLoading && featured.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#5C6660]">
            <Sparkles size={16} className="text-[#1F6D1A]" />
            {t("resources.featured")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((resource) => {
              const Icon = TYPE_ICONS[resource.type];
              return (
                <div
                  key={resource.id}
                  className="rounded-xl border border-[#C1C8C2] bg-[#012D1D] p-5 text-white"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${TYPE_TINTS[resource.type]}`}
                  >
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-semibold leading-snug">
                    {resource.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#C9D8CE]">
                    {resource.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-xl border border-[#C1C8C2] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6660]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("resources.searchPlaceholder")}
              aria-label={t("common.search")}
              className="w-full rounded-lg border border-[#C1C8C2] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#1F6D1A]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              aria-label={t("resources.type")}
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType | "all")}
            >
              <option value="all">{t("resources.allTypes")}</option>
              {RESOURCE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`resources.type_${value}`)}
                </option>
              ))}
            </select>

            <select
              aria-label={t("resources.category")}
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">{t("resources.allCategories")}</option>
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              aria-label={t("resources.language")}
              className={selectClass}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="all">{t("resources.allLanguages")}</option>
              {LANGUAGES.map((value) => (
                <option key={value} value={value}>
                  {value.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              aria-label={t("resources.sortBy")}
              className={selectClass}
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {SORTS.map((value) => (
                <option key={value} value={value}>
                  {t(SORT_LABEL_KEYS[value])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E6E1] pt-4">
          <p className="text-sm text-[#414844]">
            {t("resources.resultCount", { count: visible.length })}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[#1F6D1A] hover:underline cursor-pointer"
            >
              {t("common.clearFilters")}
            </button>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-[#C1C8C2] bg-[#c1c8c280]"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-[#191C1B]">
            {t("resources.empty")}
          </h2>
          <p className="mt-2 text-[#414844]">{t("resources.emptyHint")}</p>
          {hasFilters && (
            <Button
              variant="outline"
              className="mt-6 rounded-lg! mx-auto"
              onClick={clearFilters}
            >
              {t("common.clearFilters")}
            </Button>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((resource) => {
            const Icon = TYPE_ICONS[resource.type];
            const isExternal = Boolean(resource.externalUrl);
            const needsAuth = resource.requiresAuth && !user;

            const actionLabel = isExternal
              ? resource.type === "video"
                ? t("resources.watch")
                : t("resources.openLink")
              : t("resources.download");

            return (
              <li
                key={resource.id}
                className="flex flex-col rounded-xl border border-[#C1C8C2] bg-white p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TYPE_TINTS[resource.type]}`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="rounded-md bg-[#F2F4F2] px-2.5 py-1 text-xs font-semibold text-[#414844]">
                    {t(`resources.type_${resource.type}`)}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug text-[#191C1B]">
                  {resource.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#414844]">
                  {resource.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F2F4F2] px-2.5 py-1 text-xs text-[#414844]">
                    {resource.category}
                  </span>
                  <span className="rounded-full bg-[#F2F4F2] px-2.5 py-1 text-xs uppercase text-[#414844]">
                    {resource.language}
                  </span>
                  {resource.region && (
                    <span className="rounded-full bg-[#F2F4F2] px-2.5 py-1 text-xs text-[#414844]">
                      {resource.region.oblast}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E6E1] pt-4 text-xs text-[#5C6660]">
                  <span>
                    {t("resources.updated", {
                      date: moment(resource.updatedAt)
                        .locale(i18n.language)
                        .format("LL"),
                    })}
                  </span>
                  {!isExternal && (
                    <span>
                      {t("resources.downloads", {
                        count: resource.downloadCount,
                      })}
                      {resource.sizeKb
                        ? ` · ${formatFileSize(resource.sizeKb)}`
                        : ""}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {needsAuth ? (
                    <Link to="/auth" className="block">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg! py-2!"
                        Icon={Lock}
                        iconStyles="mr-2 w-4"
                      >
                        {t("resources.signInToDownload")}
                      </Button>
                    </Link>
                  ) : isExternal ? (
                    <a
                      href={resource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className="w-full rounded-lg! py-2!"
                        Icon={ExternalLink}
                        iconStyles="mr-2 w-4"
                      >
                        {actionLabel}
                      </Button>
                    </a>
                  ) : (
                    <a
                      href={resource.fileUrl}
                      download={resource.fileName}
                      onClick={() => registerDownload(resource.id)}
                      className="block"
                    >
                      <Button
                        className="w-full rounded-lg! py-2!"
                        Icon={Download}
                        iconStyles="mr-2 w-4"
                      >
                        {actionLabel}
                      </Button>
                    </a>
                  )}

                  {resource.requiresAuth && (
                    <p className="mt-2 text-center text-xs text-[#5C6660]">
                      {t("resources.membersOnly")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Resources;
