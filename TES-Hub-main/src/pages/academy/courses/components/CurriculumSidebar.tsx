import { Check, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import type Course from "@/types/course";
import type Enrollment from "@/types/enrollment";
import {
  isLessonComplete,
  isLessonLocked,
  orderedSections,
  sectionProgress,
} from "@/lib/utils/learning";
import { LESSON_ICONS, LESSON_TINTS, formatMinutes } from "./lessonMeta";

interface Props {
  course: Course;
  enrollment: Enrollment | null;
  activeLessonId?: string;
  onNavigate?: () => void;
}

const CurriculumSidebar = ({
  course,
  enrollment,
  activeLessonId,
  onNavigate,
}: Props) => {
  const { t } = useTranslation();
  const sections = orderedSections(course);

  if (!sections.length) {
    return (
      <p className="p-6 text-sm text-[#414844]">{t("learn.emptyCurriculum")}</p>
    );
  }

  return (
    <nav aria-label={t("learn.curriculum")} className="flex flex-col">
      {sections.map((section, index) => {
        const progress = sectionProgress(section, enrollment);

        return (
          <section
            key={section.id}
            className="border-b border-[#E1E6E1] last:border-b-0"
          >
            <header className="px-5 py-4 bg-[#F4F7F4]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6660]">
                {t("learn.moduleLabel", { number: index + 1 })}
              </p>
              <h3 className="mt-1 font-semibold text-[#191C1B] leading-snug">
                {section.title}
              </h3>
              <p className="mt-1 text-xs text-[#414844]">
                {progress.done}/{progress.total} ·{" "}
                {t("common.lessonCount", { count: progress.total })}
              </p>
            </header>

            <ul>
              {section.lessons.map((lesson) => {
                const Icon = LESSON_ICONS[lesson.type];
                const done = isLessonComplete(enrollment, lesson.id);
                const locked = isLessonLocked(lesson, enrollment);
                const isActive = lesson.id === activeLessonId;

                return (
                  <li key={lesson.id}>
                    <NavLink
                      to={`/academy/courses/${course.slug}/learn/${lesson.id}`}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-start gap-3 px-5 py-3 border-l-3 transition-colors ${
                        isActive
                          ? "border-[#1F6D1A] bg-[#EEF6EE]"
                          : "border-transparent hover:bg-[#F7F9F7]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          done
                            ? "bg-[#1F6D1A] text-white"
                            : LESSON_TINTS[lesson.type]
                        }`}
                      >
                        {done ? <Check size={15} /> : <Icon size={15} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm leading-snug ${
                            isActive
                              ? "font-semibold text-[#012D1D]"
                              : "text-[#191C1B]"
                          }`}
                        >
                          {lesson.title}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-[#5C6660]">
                          <span>{t(`course.lessonType.${lesson.type}`)}</span>
                          <span aria-hidden>·</span>
                          <span>{formatMinutes(lesson.durationMinutes)}</span>
                          {lesson.isFreePreview && !enrollment && (
                            <span className="rounded-sm bg-[#A4F792] px-1.5 py-0.5 text-[10px] font-semibold text-[#012D1D]">
                              {t("course.freePreview")}
                            </span>
                          )}
                        </span>
                      </span>

                      {locked && (
                        <Lock
                          size={14}
                          aria-label={t("course.locked")}
                          className="mt-1 shrink-0 text-[#9AA39D]"
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </nav>
  );
};

export default CurriculumSidebar;
