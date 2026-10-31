import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock4,
  Download,
  LayoutList,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import useEnrollment from "@/lib/hooks/useEnrollment";
import useCourse from "@/lib/service/useCourse";
import {
  findLesson,
  findSectionOfLesson,
  isLessonComplete,
  isLessonLocked,
  lessonNav,
  orderedSections,
  quizIdOfLesson,
} from "@/lib/utils/learning";
import LearnShell from "./components/LearnShell";
import LessonContent from "./components/LessonContent";
import {
  EnrollGate,
  LearnLoading,
  LearnMessage,
} from "./components/LearnStates";
import {
  LESSON_TINTS,
  formatFileSize,
  formatMinutes,
} from "./components/lessonMeta";

const CourseLessonDetail = () => {
  const { slug = "", lessonId = "" } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { course, error, isLoading } = useCourse(slug);
  const {
    enrollment,
    isLoading: enrollmentLoading,
    isMutating,
    error: progressError,
    enroll,
    setLessonComplete,
  } = useEnrollment(slug);

  if (isLoading || enrollmentLoading) return <LearnLoading />;

  if (error || !course) {
    return (
      <LearnMessage
        title={t("learn.loadError")}
        body={error ?? undefined}
        action={{ label: t("footer.courses"), to: "/academy/courses" }}
      />
    );
  }

  const lesson = findLesson(course, lessonId);

  if (!lesson) {
    return (
      <LearnMessage
        title={t("lesson.notFound")}
        action={{
          label: t("lesson.backToOverview"),
          to: `/academy/courses/${slug}/learn`,
        }}
      />
    );
  }

  const section = findSectionOfLesson(course, lesson.id);
  const moduleNumber =
    orderedSections(course).findIndex((s) => s.id === section?.id) + 1;
  const { index, total, previous, next } = lessonNav(course, lesson.id);
  const done = isLessonComplete(enrollment, lesson.id);
  const locked = isLessonLocked(lesson, enrollment);
  const quizId = quizIdOfLesson(lesson);
  const quizState = quizId ? enrollment?.quizState?.[quizId] : undefined;
  const isLast = !next;

  const toggleComplete = async () => {
    const updated = await setLessonComplete(lesson.id, !done);
    if (updated && !done && next) {
      navigate(`/academy/courses/${slug}/learn/${next.id}`);
    }
  };

  return (
    <LearnShell
      course={course}
      enrollment={enrollment}
      activeLessonId={lesson.id}
    >
      <div className="flex flex-col gap-6">
        <header className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C6660]">
            {section && (
              <span className="font-semibold uppercase tracking-wider">
                {t("learn.moduleLabel", { number: moduleNumber })} ·{" "}
                {section.title}
              </span>
            )}
            <span aria-hidden>·</span>
            <span>{t("lesson.positionOf", { index: index + 1, total })}</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-[#191C1B]">
            {lesson.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${LESSON_TINTS[lesson.type]}`}
            >
              {t(`course.lessonType.${lesson.type}`)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[#414844]">
              <Clock4 size={15} />
              {formatMinutes(lesson.durationMinutes)}
            </span>
            {done && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EEFBEA] px-2.5 py-1 text-xs font-semibold text-[#1F6D1A]">
                <CheckCircle2 size={14} />
                {t("lesson.completedBadge")}
              </span>
            )}
            {lesson.isFreePreview && !enrollment && (
              <span className="rounded-md bg-[#A4F792] px-2.5 py-1 text-xs font-semibold text-[#012D1D]">
                {t("course.freePreview")}
              </span>
            )}
          </div>

          {lesson.summary && (
            <p className="mt-4 text-[#414844]">{lesson.summary}</p>
          )}
        </header>

        <div className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
          {locked ? (
            <EnrollGate
              courseSlug={slug}
              onEnroll={enroll}
              isEnrolling={isMutating}
            />
          ) : (
            <LessonContent
              lesson={lesson}
              courseSlug={slug}
              quizState={quizState}
            />
          )}
        </div>

        {!locked && lesson.resources?.length ? (
          <section className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#191C1B]">
              {t("lesson.resources")}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {lesson.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    download
                    className="flex items-center gap-3 rounded-lg border border-[#E1E6E1] bg-[#F7F9F7] px-4 py-3 transition hover:border-[#1F6D1A]"
                  >
                    <Download size={18} className="shrink-0 text-[#1F6D1A]" />
                    <span className="min-w-0 flex-1 text-sm font-medium text-[#191C1B]">
                      {resource.label}
                    </span>
                    {resource.sizeKb && (
                      <span className="shrink-0 text-xs text-[#5C6660]">
                        {formatFileSize(resource.sizeKb)}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!locked && (
          <section className="rounded-xl border border-[#C1C8C2] bg-white p-6">
            {progressError && (
              <p className="mb-4 rounded-md bg-[#FEE2E2] px-4 py-3 text-sm text-[#B01919]">
                {progressError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant={done ? "outline" : "filled"}
                className="rounded-lg!"
                onClick={toggleComplete}
                disabled={isMutating}
                Icon={done ? Circle : CheckCircle2}
                iconStyles="mr-2 w-4"
              >
                {isMutating
                  ? t("lesson.saving")
                  : done
                    ? t("lesson.markIncomplete")
                    : t("lesson.markComplete")}
              </Button>

              {isLast && !done && (
                <p className="text-sm text-[#414844]">
                  {t("lesson.completeToFinish")}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E6E1] pt-5">
              {previous ? (
                <Link
                  to={`/academy/courses/${slug}/learn/${previous.id}`}
                  className="inline-flex min-w-0 items-center gap-2 text-sm text-[#414844] hover:text-[#012D1D]"
                >
                  <ChevronLeft size={18} className="shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-xs text-[#5C6660]">
                      {t("lesson.previousLesson")}
                    </span>
                    <span className="block truncate font-medium">
                      {previous.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <Link
                  to={`/academy/courses/${slug}/learn`}
                  className="inline-flex items-center gap-2 text-sm text-[#414844] hover:text-[#012D1D]"
                >
                  <LayoutList size={16} />
                  {t("lesson.backToOverview")}
                </Link>
              )}

              {next ? (
                <Link
                  to={`/academy/courses/${slug}/learn/${next.id}`}
                  className="inline-flex min-w-0 items-center gap-2 text-right text-sm text-[#414844] hover:text-[#012D1D]"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-[#5C6660]">
                      {t("lesson.nextLesson")}
                    </span>
                    <span className="block truncate font-medium">
                      {next.title}
                    </span>
                  </span>
                  <ChevronRight size={18} className="shrink-0" />
                </Link>
              ) : (
                <Link
                  to={`/academy/courses/${slug}/learn`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F6D1A]"
                >
                  {t("lesson.finishCourseCta")}
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </LearnShell>
  );
};

export default CourseLessonDetail;
