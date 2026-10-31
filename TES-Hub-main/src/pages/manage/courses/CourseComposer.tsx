import Button from "@/components/ui/button";
import useAuth from "@/lib/hooks/useAuth";
import usePermissions from "@/lib/hooks/usePermissions";
import { createCourse, updateCourse } from "@/lib/service/coursesApi";
import useCourse from "@/lib/service/useCourse";
import { slugify } from "@/lib/utils/session";
import CATEGORIES from "@/types/category";
import type Course from "@/types/course";
import { COURSE_LEVELS } from "@/types/course";
import type { EntityStatus } from "@/types/status";
import axios from "axios";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";
import { Card, Stepper, type StepDef } from "./composerUI";
import StepBasics from "./StepBasics";
import StepCurriculum from "./StepCurriculum";
import StepPricing from "./StepPricing";
import StepReview, { type ChecklistItem } from "./StepReview";
import {
  buildCoursePayload,
  draftFromCourse,
  EMPTY_DRAFT,
  formatDuration,
  totalLessons,
  totalMinutes,
  type CourseDraft,
} from "./courseDraft";

const STEP_KEYS = ["basics", "curriculum", "pricing", "review"] as const;

type Translate = (key: string, options?: Record<string, unknown>) => string;

const buildBasicsSchema = (t: Translate) =>
  z.object({
    title: z.string().trim().min(1, t("composer.errors.titleRequired")),
    shortDescription: z
      .string()
      .trim()
      .min(1, t("composer.errors.shortDescriptionRequired")),
    category: z.enum(CATEGORIES, {
      error: t("composer.errors.categoryRequired"),
    }),
    level: z.enum(COURSE_LEVELS, {
      error: t("composer.errors.levelRequired"),
    }),
  });

const buildPricingSchema = (t: Translate) =>
  z
    .object({
      priceModel: z.enum(["free", "one_time"]),
      amount: z.union([z.number(), z.literal("")]),
      discountPercent: z.union([z.number(), z.literal("")]),
    })
    .refine((v) => v.priceModel === "free" || Number(v.amount) > 0, {
      message: t("composer.errors.priceAboveZero"),
      path: ["amount"],
    })
    .refine(
      (v) =>
        v.discountPercent === "" ||
        (Number(v.discountPercent) >= 0 && Number(v.discountPercent) <= 100),
      {
        message: t("composer.errors.discountRange"),
        path: ["discountPercent"],
      },
    );

function issuesToErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    fieldErrors[issue.path[0] as string] = issue.message;
  });
  return fieldErrors;
}

function validateCurriculum(
  draft: CourseDraft,
  t: Translate,
): Record<string, string> {
  if (!draft.sections.length) {
    return { sections: t("composer.errors.sectionsRequired") };
  }
  if (draft.sections.some((s) => !s.title.trim())) {
    return { sections: t("composer.errors.moduleTitleRequired") };
  }
  if (draft.sections.some((s) => !s.lessons.length)) {
    return { sections: t("composer.errors.moduleLessonRequired") };
  }
  if (draft.sections.some((s) => s.lessons.some((l) => !l.title.trim()))) {
    return { sections: t("composer.errors.lessonTitleRequired") };
  }
  return {};
}

function validateStep(
  step: number,
  draft: CourseDraft,
  t: Translate,
): Record<string, string> {
  if (step === 0) {
    const parsed = buildBasicsSchema(t).safeParse(draft);
    return parsed.success ? {} : issuesToErrors(parsed.error);
  }
  if (step === 1) return validateCurriculum(draft, t);
  if (step === 2) {
    const parsed = buildPricingSchema(t).safeParse(draft);
    return parsed.success ? {} : issuesToErrors(parsed.error);
  }
  return {};
}

const Composer = ({ course }: { course: Course | null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const STEPS: StepDef[] = STEP_KEYS.map((key) => ({
    key,
    label: t(`composer.steps.${key}`),
  }));

  const STEP_HEADINGS = STEP_KEYS.map((key) => ({
    title: t(`composer.headings.${key}Title`),
    subtitle: t(`composer.headings.${key}Subtitle`),
  }));

  const [draft, setDraft] = useState<CourseDraft>(
    course ? draftFromCourse(course) : EMPTY_DRAFT,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(course ? STEPS.length - 1 : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(
    course?.slug ?? null,
  );

  function set<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "title" && !savedSlug) next.slug = slugify(String(value));
      return next;
    });
  }

  async function persist(status: EntityStatus) {
    const payload = buildCoursePayload(
      {
        ...draft,
        coverImage: coverFile
          ? URL.createObjectURL(coverFile)
          : draft.coverImage,
      },
      status,
      auth?.id ?? "user-tes-admin-1",
    );

    const saved = savedSlug
      ? await updateCourse(savedSlug, payload)
      : await createCourse(payload);

    setSavedSlug(saved.slug);
    setDraft((d) => ({
      ...d,
      slug: saved.slug,
      coverImage: saved.coverImage ?? d.coverImage,
    }));
    setCoverFile(null);
    return saved;
  }

  async function saveAndContinue() {
    const stepErrors = validateStep(step, draft, t);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      setBanner(t("composer.fixFields"));
      return;
    }

    setBanner(null);
    setSaving(true);
    try {
      await persist(course?.status ?? "draft");
      const next = Math.min(step + 1, STEPS.length - 1);
      setStep(next);
      setFurthest((f) => Math.max(f, next));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setBanner(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : t("composer.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function finish(status: EntityStatus) {
    setSaving(true);
    setBanner(null);
    try {
      await persist(status);
      navigate("/manage/courses");
    } catch (err) {
      setBanner(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : t("composer.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  function goToStep(next: number) {
    if (next > step) {
      const stepErrors = validateStep(step, draft, t);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length) return;
    }
    setBanner(null);
    setStep(next);
  }

  const checklist: ChecklistItem[] = useMemo(() => {
    const lessons = totalLessons(draft.sections);
    const basicsDone = !Object.keys(validateStep(0, draft, t)).length;
    const curriculumDone = !Object.keys(validateCurriculum(draft, t)).length;
    const pricingDone = !Object.keys(validateStep(2, draft, t)).length;

    return [
      {
        key: "basics",
        label: t("composer.review.basicsDone"),
        detail: t("composer.review.basicsDetail"),
        done: basicsDone,
      },
      {
        key: "curriculum",
        label: t("composer.review.curriculumDone"),
        detail: t("composer.review.curriculumDetail", {
          modules: t("manage.courses.moduleCount", {
            count: draft.sections.length,
          }),
          lessons: t("manage.courses.lessonCount", { count: lessons }),
          duration: formatDuration(totalMinutes(draft.sections)),
        }),
        done: curriculumDone,
      },
      {
        key: "pricing",
        label: t("composer.review.pricingDone"),
        detail:
          draft.priceModel === "free"
            ? t("composer.review.pricingFree")
            : `${draft.currency} ${draft.amount || 0}`,
        done: pricingDone,
      },
      {
        key: "expertReview",
        label: t("composer.review.expertReview"),
        detail: t("composer.review.expertReviewDetail"),
        done: false,
      },
    ];
  }, [draft, t]);

  const heading = STEP_HEADINGS[step];
  const isReview = step === STEPS.length - 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-16 max-w-4xl">
      <button
        type="button"
        onClick={() => navigate("/manage/courses")}
        className="flex items-center gap-1 text-sm text-[#414844] hover:text-[#012D1D] cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t("composer.backToCourses")}
      </button>

      <h1 className="text-[#012D1D] text-4xl lg:text-5xl font-bold mt-4">
        {step === 0 && course
          ? t("composer.headings.editCourse")
          : heading.title}
      </h1>
      <p className="text-[#414844] text-sm mt-2">{heading.subtitle}</p>

      <Stepper
        steps={STEPS}
        current={step}
        furthest={furthest}
        onSelect={goToStep}
      />

      {banner && (
        <div className="flex gap-3 border-l-4 p-4 border-[#BA1A1A] bg-[#FFDAD6] rounded-lg mt-6">
          <TriangleAlert color="#93000A" size={20} />
          <p className="text-sm text-[#93000A]">{banner}</p>
        </div>
      )}

      <div className="mt-8">
        {step === 0 && (
          <Card>
            <StepBasics
              draft={draft}
              set={set}
              errors={errors}
              coverFile={coverFile}
              setCoverFile={setCoverFile}
            />
          </Card>
        )}

        {step === 1 && (
          <StepCurriculum
            sections={draft.sections}
            onChange={(sections) => set("sections", sections)}
            error={errors.sections}
          />
        )}

        {step === 2 && (
          <Card>
            <StepPricing draft={draft} set={set} errors={errors} />
          </Card>
        )}

        {isReview && (
          <StepReview
            draft={draft}
            checklist={checklist}
            saving={saving}
            onSubmit={() => finish("pending_review")}
            onSaveDraft={() => finish("draft")}
            onEditCurriculum={() => setStep(1)}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          className="rounded-md! px-5! py-2!"
          disabled={step === 0 || saving}
          onClick={() => goToStep(step - 1)}
        >
          {t("common.back")}
        </Button>

        {!isReview && (
          <Button
            className="rounded-md! px-5! py-2! gap-2"
            disabled={saving}
            onClick={saveAndContinue}
          >
            {saving ? t("common.saving") : t("composer.saveAndContinue")}
            <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
};

const CourseComposer = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const isNew = slug === "new";
  const { can } = usePermissions();
  const { course, isLoading, error } = useCourse(isNew ? "" : (slug ?? ""));

  if (!can("createCourse") && !can("moderateContent")) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-20">
        <h1 className="text-[#012D1D] text-3xl font-bold">
          {t("composer.noPermissionTitle")}
        </h1>
        <p className="text-[#414844] mt-2">{t("composer.noPermissionText")}</p>
      </div>
    );
  }

  if (!isNew && isLoading) {
    return (
      <div className="container mx-auto px-10 py-20 text-[#414844]">
        {t("composer.loading")}
      </div>
    );
  }

  if (!isNew && (error || !course)) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-20">
        <h1 className="text-[#012D1D] text-3xl font-bold">
          {t("composer.notFound")}
        </h1>
        <p className="text-[#414844] mt-2">
          {error ?? t("composer.notFoundText", { slug })}
        </p>
      </div>
    );
  }

  return <Composer key={slug} course={isNew ? null : course} />;
};

export default CourseComposer;
