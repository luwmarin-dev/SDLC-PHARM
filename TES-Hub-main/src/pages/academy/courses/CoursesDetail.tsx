import useCourse from "@/lib/service/useCourse";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  ChevronDown,
  Clock4,
  Download,
  Infinity as InfinityIcon,
  MonitorSmartphone,
  Play,
  Star,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type Pricing from "@/types/pricing";
import Button from "@/components/ui/button";
import useEnrollment from "@/lib/hooks/useEnrollment";
import { orderedSections, resumeLessonId } from "@/lib/utils/learning";
import ProgressBar from "./components/ProgressBar";
import { LESSON_ICONS, formatMinutes } from "./components/lessonMeta";

const LEVEL_STYLES = {
  beginner: "bg-[#A4F792] text-[#012D1D]",
  intermediate: "bg-[#FFDCC3] text-[#5E3000]",
  advanced: "bg-[#5E3000] text-white",
} as const;

const currencySymbols = {
  KGS: "с",
  USD: "$",
  RUB: "₽",
};

const formatPrice = (amount: number, currency: Pricing["currency"]) =>
  `${currencySymbols[currency]}${Math.round(amount).toLocaleString()}`;

const CoursesDetail = () => {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { course, error, isLoading } = useCourse(slug);
  const { enrollment, isEnrolled, isMutating, enroll } = useEnrollment(slug);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = orderedSections(course);
  const activeSection = openSection ?? sections[0]?.id ?? null;

  const lessons = sections.flatMap((section) => section.lessons);
  const videoHours = Math.round(
    lessons
      .filter((lesson) => lesson.type === "video")
      .reduce((total, lesson) => total + lesson.durationMinutes, 0) / 60,
  );
  const downloadableCount = lessons.filter(
    (lesson) => lesson.type === "pdf",
  ).length;

  const pricing = course?.pricing;
  const listPrice = pricing?.amount ?? 0;
  const discountPercent = pricing?.hasDiscount
    ? (pricing.discountPercent ?? 0)
    : 0;
  const finalPrice = listPrice * (1 - discountPercent / 100);

  const handleEnroll = async () => {
    if (!isEnrolled) {
      const created = await enroll();
      if (!created) return;
    }
    const target = resumeLessonId(course, enrollment);
    navigate(
      target
        ? `/academy/courses/${slug}/learn/${target}`
        : `/academy/courses/${slug}/learn`,
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="h-96 animate-pulse rounded-xl bg-[#c1c8c280]" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#191C1B]">
          {t("learn.loadError")}
        </h1>
        {error && <p className="mt-2 text-[#414844]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-6 justify-between py-5 px-4 sm:px-6 lg:px-10 my-10">
      <div className="flex flex-col gap-8 w-full lg:w-[70%]">
        <div className="p-6 sm:p-8 border border-[#C1C8C2] bg-[#FFFFFF] rounded-lg">
          <header className="flex flex-wrap items-center gap-3">
            <div
              className={`rounded-xl px-3 py-1 text-xs w-max ${LEVEL_STYLES[course.level]}`}
            >
              {t(`course.level.${course.level}`)}
            </div>
            <div className="text-[#414844] flex gap-1 items-center text-sm">
              <Clock4 size={17} />
              <p>
                {t("common.hourCount", {
                  count: course.estimatedDurationHours,
                })}
              </p>
            </div>
            <div className="text-[#414844] text-sm">
              {t("common.lessonCount", { count: lessons.length })}
            </div>
          </header>

          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#191C1B]">
            {course.title}
          </h1>
          <p className="text-[#414844] text-lg my-4">
            {course.longDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex text-[#1F6D1A]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < Math.round(course.rating) ? "currentColor" : "none"
                    }
                  />
                ))}
              </div>
              <p className="text-[#191C1B] font-semibold text-sm">
                {t("course.reviews", {
                  rating: course.rating,
                  count: course.reviewCount,
                })}
              </p>
            </div>
            <div className="text-[#C1C8C2] text-base">|</div>
            <p className="text-[#414844] text-sm">
              {t("common.studentCount", { count: course.enrollmentCount })}
            </p>
          </div>

          {isEnrolled && (
            <div className="mt-6 rounded-lg border border-[#E1E6E1] bg-[#F7F9F7] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#012D1D]">
                  {t("learn.percentComplete", {
                    percent: enrollment?.progressPercent ?? 0,
                  })}
                </p>
                <Link
                  to={`/academy/courses/${slug}/learn`}
                  className="text-sm font-semibold text-[#1F6D1A] hover:underline"
                >
                  {t("learn.overview")}
                </Link>
              </div>
              <ProgressBar
                percent={enrollment?.progressPercent ?? 0}
                className="mt-3"
              />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 border border-[#C1C8C2] bg-[#FFFFFF] rounded-lg">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#191C1B]">
            {t("course.curriculum")}
          </h2>

          <div className="mt-6 flex flex-col gap-4">
            {sections.map((section, index) => {
              const isOpen = section.id === activeSection;

              return (
                <div
                  key={section.id}
                  className="border border-[#C1C8C2] rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer ${
                      isOpen ? "bg-[#F4F7F4]" : "bg-[#FFFFFF]"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full text-sm font-semibold ${
                        isOpen
                          ? "bg-[#1F3D2B] text-[#FFFFFF]"
                          : "bg-[#E1E6E1] text-[#414844]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 font-semibold text-[#191C1B]">
                      {section.title}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[#414844] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <ul className="border-t border-[#C1C8C2] bg-[#FFFFFF]">
                      {section.lessons.map((lesson) => {
                        const Icon = LESSON_ICONS[lesson.type];
                        const openable = lesson.isFreePreview || isEnrolled;

                        const row = (
                          <>
                            <Icon
                              size={18}
                              className="shrink-0 text-[#414844]"
                            />
                            <span className="flex-1 text-[#191C1B]">
                              {t(`course.lessonType.${lesson.type}`)}:{" "}
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && !isEnrolled && (
                              <span className="shrink-0 rounded-sm bg-[#A4F792] px-2 py-0.5 text-[10px] font-semibold text-[#012D1D]">
                                {t("course.freePreview")}
                              </span>
                            )}
                            <span className="shrink-0 text-sm text-[#414844]">
                              {formatMinutes(lesson.durationMinutes)}
                            </span>
                          </>
                        );

                        return (
                          <li
                            key={lesson.id}
                            className="border-b border-[#E1E6E1] last:border-b-0"
                          >
                            {openable ? (
                              <Link
                                to={`/academy/courses/${slug}/learn/${lesson.id}`}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9F7]"
                              >
                                {row}
                              </Link>
                            ) : (
                              <div className="flex items-center gap-3 px-5 py-3">
                                {row}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 h-max lg:sticky lg:top-28 w-full lg:w-[30%]">
        <div className="pb-6 border border-[#C1C8C2] bg-[#FFFFFF] rounded-lg overflow-hidden">
          <div className="relative">
            <img
              src={course.coverImage}
              alt=""
              className="w-full h-60 object-cover"
            />
            <button
              type="button"
              aria-label={t("course.previewCourse")}
              className="absolute inset-0 m-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFFFFF] shadow-lg cursor-pointer transition duration-100 active:scale-90"
            >
              <Play size={26} className="text-[#1F6D1A] ml-1" />
            </button>
          </div>
          <div className="p-6">
            {course.pricing.model === "free" ? (
              <div className="flex items-center justify-between">
                <p className="text-[#267320] text-3xl font-bold">
                  {t("course.free")}
                </p>
                <div className="text-[#267320] bg-[#A4F792] py-1 px-2 w-max font-semibold rounded-xs">
                  {t("course.fullDiscount")}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-[#191C1B] text-3xl font-bold">
                    {formatPrice(finalPrice, pricing?.currency ?? "USD")}
                  </p>
                  {discountPercent > 0 && (
                    <p className="text-[#414844] text-lg line-through">
                      {formatPrice(listPrice, pricing?.currency ?? "USD")}
                    </p>
                  )}
                </div>
                {discountPercent > 0 && (
                  <div className="text-[#267320] bg-[#A4F792] py-1 px-2 w-max font-semibold rounded-xs">
                    {t("course.offBadge", { percent: discountPercent })}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full rounded-sm! mt-6"
              onClick={handleEnroll}
              disabled={isMutating}
            >
              {isMutating
                ? t("course.enrolling")
                : isEnrolled
                  ? t("course.continueLearning")
                  : t("course.enrollNow")}
            </Button>

            {course.pricing.isRefundable && course.pricing.refundDays && (
              <p className="mt-4 text-center text-sm text-[#414844]">
                {t("course.moneyBack", { count: course.pricing.refundDays })}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border border-[#C1C8C2] bg-[#FFFFFF] rounded-lg">
          <h2 className="text-2xl font-bold text-[#191C1B]">
            {t("course.includes")}
          </h2>
          <ul className="mt-5 flex flex-col gap-4">
            {videoHours > 0 && (
              <li className="flex items-center gap-3 text-[#191C1B]">
                <Video size={20} className="shrink-0 text-[#414844]" />
                <span>{t("course.onDemandVideo", { count: videoHours })}</span>
              </li>
            )}
            {downloadableCount > 0 && (
              <li className="flex items-center gap-3 text-[#191C1B]">
                <Download size={20} className="shrink-0 text-[#414844]" />
                <span>
                  {t("course.downloadableResources", {
                    count: downloadableCount,
                  })}
                </span>
              </li>
            )}
            <li className="flex items-center gap-3 text-[#191C1B]">
              <InfinityIcon size={20} className="shrink-0 text-[#414844]" />
              <span>{t("course.lifetimeAccess")}</span>
            </li>
            <li className="flex items-center gap-3 text-[#191C1B]">
              <MonitorSmartphone
                size={20}
                className="shrink-0 text-[#414844]"
              />
              <span>{t("course.mobileAccess")}</span>
            </li>
            {course.certificateTemplate && (
              <li className="flex items-center gap-3 text-[#191C1B]">
                <Award size={20} className="shrink-0 text-[#414844]" />
                <span>{t("course.certificateIncluded")}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoursesDetail;
