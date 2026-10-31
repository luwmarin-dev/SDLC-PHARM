import { Award, ChevronLeft, ListTree, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type Course from "@/types/course";
import type Enrollment from "@/types/enrollment";
import { orderedLessons } from "@/lib/utils/learning";
import CurriculumSidebar from "./CurriculumSidebar";
import ProgressBar from "./ProgressBar";

interface Props {
  course: Course;
  enrollment: Enrollment | null;
  activeLessonId?: string;
  children: ReactNode;
}

const LearnShell = ({
  course,
  enrollment,
  activeLessonId,
  children,
}: Props) => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const total = orderedLessons(course).length;
  const done = enrollment?.completedLessonIds.length ?? 0;
  const percent = enrollment?.progressPercent ?? 0;

  return (
    <div className="min-h-screen bg-[#F4F7F4]">
      <div className="bg-[#012D1D] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <Link
                to={`/academy/courses/${course.slug}`}
                className="inline-flex items-center gap-1 text-xs text-[#A4F792] hover:underline"
              >
                <ChevronLeft size={14} />
                {t("course.backToCourse")}
              </Link>
              <h1 className="mt-1 truncate text-xl sm:text-2xl font-bold">
                {course.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {enrollment?.certificateId && (
                <Link
                  to={`/academy/courses/${course.slug}/certificate`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#A4F792] px-4 py-2 text-sm font-semibold text-[#012D1D] transition active:scale-95"
                >
                  <Award size={16} />
                  {t("learn.viewCertificate")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#FFFFFF40] px-4 py-2 text-sm font-semibold lg:hidden"
              >
                <ListTree size={16} />
                {t("learn.curriculum")}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <ProgressBar tone="light" percent={percent} className="flex-1" />
            <p className="shrink-0 text-xs text-[#D6E3D9]">
              {t("learn.percentComplete", { percent })} ·{" "}
              {t("learn.lessonsCompleted", { done, total })}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex gap-8 px-4 sm:px-6 lg:px-10 py-8">
        <aside className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl border border-[#C1C8C2] bg-white">
            <CurriculumSidebar
              course={course}
              enrollment={enrollment}
              activeLessonId={activeLessonId}
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E1E6E1] bg-white px-5 py-4">
              <h2 className="font-semibold text-[#191C1B]">
                {t("learn.curriculum")}
              </h2>
              <button
                type="button"
                aria-label={t("learn.closeCurriculum")}
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1 text-[#414844] hover:bg-[#F2F4F2]"
              >
                <X size={20} />
              </button>
            </div>
            <CurriculumSidebar
              course={course}
              enrollment={enrollment}
              activeLessonId={activeLessonId}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnShell;
