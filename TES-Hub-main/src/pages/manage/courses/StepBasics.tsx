import CoverImage from "@/components/ui/coverImage";
import Editor from "@/components/ui/editor";
import CATEGORIES, { CATEGORY_KEYS, type Category } from "@/types/category";
import { useTranslation } from "react-i18next";
import { COURSE_LEVELS, type CourseLevel } from "@/types/course";
import { Field, inputClass } from "./composerUI";
import { LEVEL_KEYS, type CourseDraft } from "./courseDraft";

interface Props {
  draft: CourseDraft;
  set: <K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) => void;
  errors: Record<string, string>;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
}

const StepBasics = ({ draft, set, errors, coverFile, setCoverFile }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <Field
        label={t("composer.basics.titleLabel")}
        required
        hint={t("composer.basics.titleHint")}
        error={errors.title}
      >
        <input
          className={inputClass}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("composer.basics.titlePlaceholder")}
        />
      </Field>

      <Field
        label={t("composer.basics.shortDescription")}
        required
        error={errors.shortDescription}
        hint={t("composer.basics.shortDescriptionHint")}
      >
        <textarea
          className={`${inputClass} h-24 py-3 resize-y`}
          value={draft.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder={t("composer.basics.shortDescriptionPlaceholder")}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field
          label={t("composer.basics.category")}
          required
          error={errors.category}
        >
          <select
            className={inputClass}
            value={draft.category}
            onChange={(e) => set("category", e.target.value as Category)}
          >
            <option value="">{t("composer.basics.selectCategory")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(CATEGORY_KEYS[c])}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("composer.basics.level")} required error={errors.level}>
          <select
            className={inputClass}
            value={draft.level}
            onChange={(e) => set("level", e.target.value as CourseLevel)}
          >
            <option value="">{t("composer.basics.selectLevel")}</option>
            {COURSE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {t(LEVEL_KEYS[l])}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <span className="text-[#191C1B] text-sm font-semibold">
          {t("composer.basics.longDescription")}
        </span>
        <Editor
          className="mt-2 rounded-lg overflow-hidden"
          value={draft.longDescription}
          onChange={(html) => set("longDescription", html)}
          placeholder={t("composer.basics.longDescriptionPlaceholder")}
          error={errors.longDescription}
        />
      </div>

      <CoverImage
        coverImage={coverFile}
        setCoverImage={setCoverFile}
        existingUrl={draft.coverImage}
        error={errors.coverImage}
      />
    </div>
  );
};

export default StepBasics;
