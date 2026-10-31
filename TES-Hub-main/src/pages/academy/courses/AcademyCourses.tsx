import CardSkeleton from "@/components/ui/cardSkeleton";
import CourseCard from "@/components/ui/courseCard";
import useCourses from "@/lib/hooks/useCourses";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchInput from "./../../../components/ui/searchInput";

const AcademyCourses = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const { published, error, isLoading } = useCourses();

  const filtered = published?.filter((c) =>
    c.title
      .toLocaleLowerCase()
      .includes(search?.toLocaleLowerCase().trim().replace(/\s/g, " ")),
  );

  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil((filtered ?? []).length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = (filtered ?? []).slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (error)
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-5">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("academy.errorOccurred")}
        </h1>
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div>
          <h1 className="text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t("academy.coursesTitle")}
          </h1>
          <h3 className="mt-3">{t("academy.coursesSubtitle")}</h3>
        </div>
        <div className="w-full md:w-auto md:min-w-[280px]">
          <SearchInput
            onChange={(e) => {
              setSearch(e);
              setPage(1);
            }}
            placeholder={t("academy.searchCourses")}
          />
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          : pageItems.map((p) => <CourseCard key={p.id} course={p} />)}

        {pageItems.length === 0 && t("academy.noCourses")}
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
  );
};

export default AcademyCourses;
