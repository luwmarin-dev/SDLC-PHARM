import moment from "moment";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock4,
  Download,
  Infinity as InfinityIcon,
  MonitorSmartphone,
  PlayCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import useEnrollment from "@/lib/hooks/useEnrollment";
import useCourse from "@/lib/service/useCourse";
import sanitize from "@/lib/sanitize";
import {
  orderedLessons,
  remainingMinutes,
  resumeLessonId,
} from "@/lib/utils/learning";
import CurriculumSidebar from "./components/CurriculumSidebar";
import LearnShell from "./components/LearnShell";
import { LearnLoading, LearnMessage } from "./components/LearnStates";
import ProgressBar from "./components/ProgressBar";
import { formatMinutes } from "./components/lessonMeta";

const CourseLearn = () => {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { course, error, isLoading } = useCourse(slug);
  const {
    enrollment,
    isEnrolled,
    isLoading: enrollmentLoading,
    isMutating,
    enroll,
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

  const lessons = orderedLessons(course);
  const resumeId = resumeLessonId(course, enrollment);
  const left = remainingMinutes(course, enrollment);
  const isComplete = Boolean(enrollment?.completedAt);
  const started = (enrollment?.completedLessonIds.length ?? 0) > 0;
  const videoHours = Math.round(
    lessons
      .filter((lesson) => lesson.type === "video")
      .reduce((sum, lesson) => sum + lesson.durationMinutes, 0) / 60,
  );
  const downloadables = lessons.filter(
    (lesson) => lesson.type === "pdf",
  ).length;

  const handleStart = async () => {
    if (!isEnrolled) {
      const created = await enroll();
      if (!created) return;
    }
    if (resumeId) navigate(`/academy/courses/${slug}/learn/${resumeId}`);
  };

  const primaryLabel = !isEnrolled
    ? t("learn.enrollToStart")
    : isComplete
      ? t("learn.reviewCourse")
      : started
        ? t("learn.resume")
        : t("learn.startCourse");

  const localDate = (value?: string) =>
    value ? moment(value).locale(i18n.language).format("LL") : "";

  return (
    <LearnShell course={course} enrollment={enrollment}>
      <div className="flex flex-col gap-6">
        {isComplete && (
          <div className="rounded-xl border border-[#A4F792] bg-[#EEFBEA] p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A4F792]">
                <Award className="text-[#012D1D]" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-[#012D1D]">
                  {t("learn.courseCompleteTitle")}
                </h2>
                <p className="mt-1 text-sm text-[#2F4A3A]">
                  {t("learn.courseCompleteBody", {
                    date: localDate(enrollment?.completedAt),
                  })}
                </p>
              </div>
              {enrollment?.certificateId && (
                <Link to={`/academy/courses/${slug}/certificate`}>
                  <Button className="rounded-lg!">
                    {t("learn.viewCertificate")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        <section className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#191C1B]">
            {t("learn.yourProgress")}
          </h2>

          <div className="mt-5">
            <ProgressBar percent={enrollment?.progressPercent ?? 0} />
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#414844]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#1F6D1A]" />
                {t("learn.lessonsCompleted", {
                  done: enrollment?.completedLessonIds.length ?? 0,
                  total: lessons.length,
                })}
              </span>
              {left > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Clock4 size={16} />
                  {t("learn.timeRemaining", { time: formatMinutes(left) })}
                </span>
              )}
              {enrollment && (
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck size={16} />
                  {t("learn.enrolledOn", {
                    date: localDate(enrollment.enrolledAt),
                  })}
                </span>
              )}
            </div>
          </div>

          {!isEnrolled && (
            <div className="mt-6 rounded-lg border border-[#E1E6E1] bg-[#F7F9F7] p-5">
              <h3 className="font-semibold text-[#191C1B]">
                {t("learn.notEnrolledTitle")}
              </h3>
              <p className="mt-2 text-sm text-[#414844]">
                {t("learn.notEnrolledBody")}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="rounded-lg!"
              onClick={handleStart}
              disabled={isMutating || !resumeId}
              Icon={PlayCircle}
              iconStyles="mr-2"
            >
              {isMutating ? t("course.enrolling") : primaryLabel}
            </Button>
            <Link to={`/academy/courses/${slug}`}>
              <Button variant="outline" className="rounded-lg!">
                {t("course.backToCourse")}
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#5C6660]">
            {t("learn.completionRule", {
              percent: course.completionThresholdPercent,
            })}
          </p>
        </section>

        <section className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#191C1B]">
            {t("learn.aboutThisCourse")}
          </h2>
          <div
            className="prose mt-4 max-w-none text-[#414844]"
            dangerouslySetInnerHTML={{
              __html: sanitize(course.longDescription),
            }}
          />

          <h3 className="mt-8 text-lg font-semibold text-[#191C1B]">
            {t("learn.whatYouGet")}
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li className="flex items-center gap-3 text-sm text-[#191C1B]">
              <BookOpen size={18} className="shrink-0 text-[#414844]" />
              {t("common.lessonCount", { count: lessons.length })}
            </li>
            {videoHours > 0 && (
              <li className="flex items-center gap-3 text-sm text-[#191C1B]">
                <PlayCircle size={18} className="shrink-0 text-[#414844]" />
                {t("course.onDemandVideo", { count: videoHours })}
              </li>
            )}
            {downloadables > 0 && (
              <li className="flex items-center gap-3 text-sm text-[#191C1B]">
                <Download size={18} className="shrink-0 text-[#414844]" />
                {t("course.downloadableResources", { count: downloadables })}
              </li>
            )}
            <li className="flex items-center gap-3 text-sm text-[#191C1B]">
              <InfinityIcon size={18} className="shrink-0 text-[#414844]" />
              {t("course.lifetimeAccess")}
            </li>
            <li className="flex items-center gap-3 text-sm text-[#191C1B]">
              <MonitorSmartphone
                size={18}
                className="shrink-0 text-[#414844]"
              />
              {t("course.mobileAccess")}
            </li>
            {course.certificateTemplate && (
              <li className="flex items-center gap-3 text-sm text-[#191C1B]">
                <Award size={18} className="shrink-0 text-[#414844]" />
                {t("course.certificateIncluded")}
              </li>
            )}
          </ul>
        </section>

        <section className="lg:hidden overflow-hidden rounded-xl border border-[#C1C8C2] bg-white">
          <h2 className="border-b border-[#E1E6E1] px-5 py-4 text-lg font-semibold text-[#191C1B]">
            {t("learn.curriculum")}
          </h2>
          <CurriculumSidebar course={course} enrollment={enrollment} />
        </section>
      </div>
    </LearnShell>
  );
};

export default CourseLearn;
