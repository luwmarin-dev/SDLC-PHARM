import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArticleCard from "@/components/ui/articleCard";
import CourseCard from "@/components/ui/courseCard";
import CardSkeleton from "@/components/ui/cardSkeleton";
import useAcademyProducts, {
  type AcademyProduct,
} from "@/lib/hooks/useAcademyProducts";
import CATEGORIES, { CATEGORY_KEYS, type Category } from "@/types/category";

type AccessType = "all" | "free" | "premium";
type Format = "video" | "written" | "audio";
type SortBy = "recent" | "popular";

const FORMAT_OPTIONS: { value: Format; labelKey: string }[] = [
  { value: "video", labelKey: "academy.videoCourses" },
  { value: "written", labelKey: "academy.writtenArticles" },
  { value: "audio", labelKey: "academy.audioGuides" },
];

const FORMAT_BY_TYPE: Record<AcademyProduct["type"], Format> = {
  course: "video",
  article: "written",
};

const PAGE_SIZE = 6;

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const ProductList = () => {
  const { t } = useTranslation();
  const { products, isLoading, error } = useAcademyProducts();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accessType, setAccessType] = useState<AccessType>("all");
  const [formats, setFormats] = useState<Format[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      if (categories.length && !categories.includes(p.category)) return false;
      if (accessType === "free" && p.pricing.model !== "free") return false;
      if (accessType === "premium" && p.pricing.model === "free") return false;
      if (formats.length && !formats.includes(FORMAT_BY_TYPE[p.type]))
        return false;
      return true;
    });

    return sortBy === "popular"
      ? [...result].sort((a, b) => b.stats.views - a.stats.views)
      : result;
  }, [products, categories, accessType, formats, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const updateFilter =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  if (error) {
    return (
      <p className="text-[#C1292E] mt-10">
        {t("academy.loadError", { error })}
      </p>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-10 items-start">
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8 border border-[#C1C8C2] rounded-sm px-6 sm:px-8 pt-8 lg:pt-14 pb-8">
        <div>
          <h4 className="text-[#012D1D] font-semibold mb-3 text-2xl">
            {t("academy.categories")}
          </h4>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 text-[#414844] text-base cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={() =>
                    updateFilter<Category[]>(setCategories)(
                      toggle(categories, c),
                    )
                  }
                  className="accent-[#1F6D1A]  hover:border-blue-500 hover:bg-blue-50"
                />
                {t(CATEGORY_KEYS[c])}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[#012D1D] font-semibold mb-3 text-2xl">
            {t("academy.accessType")}
          </h4>
          <div className="flex flex-col gap-2">
            {(
              [
                { value: "all", label: t("academy.allContent") },
                { value: "free", label: t("academy.freeResources") },
                { value: "premium", label: t("academy.premiumCourses") },
              ] as { value: AccessType; label: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-[#414844] text-base cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="access-type"
                  checked={accessType === opt.value}
                  onChange={() =>
                    updateFilter<AccessType>(setAccessType)(opt.value)
                  }
                  className="accent-[#1F6D1A]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[#012D1D] font-semibold mb-3 text-2xl">
            {t("academy.format")}
          </h4>
          <div className="flex flex-col gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-[#414844] text-base cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={formats.includes(opt.value)}
                  onChange={() =>
                    updateFilter<Format[]>(setFormats)(
                      toggle(formats, opt.value),
                    )
                  }
                  className="accent-[#1F6D1A]"
                />
                {t(opt.labelKey)}
              </label>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <p className="text-[#414844]">
            {isLoading
              ? t("common.loading")
              : t("academy.showingResources", { count: filtered.length })}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="border border-[#C1C8C2] rounded-sm px-3 py-1.5 text-sm text-[#414844] w-full sm:w-auto"
          >
            <option value="recent">{t("academy.sortRecent")}</option>
            <option value="popular">{t("academy.sortPopular")}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : pageItems.map((p) =>
                p.type === "course" ? (
                  <CourseCard key={p.id} course={p} />
                ) : (
                  <ArticleCard key={p.id} article={p} />
                ),
              )}
        </div>

        {!isLoading && pageCount > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-sm text-sm ${
                  n === currentPage
                    ? "bg-[#012D1D] text-white"
                    : "border border-[#C1C8C2] text-[#414844]"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
              className="p-2 rounded-sm border border-[#C1C8C2] disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
