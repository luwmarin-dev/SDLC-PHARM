import Button from "@/components/ui/button";
import { CheckCircle2, Circle, ImageIcon, SendHorizonal } from "lucide-react";
import { Clock, FileCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CATEGORY_KEYS, type Category } from "@/types/category";
import {
  formatDuration,
  LEVEL_KEYS,
  totalMinutes,
  type CourseDraft,
} from "./courseDraft";

export interface ChecklistItem {
  key: string;
  label: string;
  detail: string;
  done: boolean;
}

interface Props {
  draft: CourseDraft;
  checklist: ChecklistItem[];
  saving: boolean;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onEditCurriculum: () => void;
}

const StepReview = ({
  draft,
  checklist,
  saving,
  onSubmit,
  onSaveDraft,
  onEditCurriculum,
}: Props) => {
  const { t } = useTranslation();
  const minutes = totalMinutes(draft.sections);
  const canSubmit = checklist
    .filter((c) => c.key !== "expertReview")
    .every((c) => c.done);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 border border-[#C1C8C2] rounded-xl bg-white overflow-hidden">
        <div className="relative h-52 bg-[#E6E9E7] flex items-center justify-center">
          {draft.coverImage ? (
            <img
              src={draft.coverImage}
              alt={draft.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon size={32} className="text-[#9CA3AF]" />
          )}
          <span className="absolute top-3 right-3 bg-[#FEF3C7] text-[#B45309] text-xs font-semibold px-2 py-1 rounded">
            {t("composer.review.draftPreview")}
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            {draft.category && (
              <span className="bg-[#A4F792] text-[#267320] text-xs font-semibold px-2 py-1 rounded-xs">
                {t(CATEGORY_KEYS[draft.category as Category])}
              </span>
            )}
            {draft.level && (
              <span className="text-[#414844] text-xs">
                {t(LEVEL_KEYS[draft.level])}
              </span>
            )}
            <span className="flex items-center gap-1 text-[#414844] text-xs">
              <Clock size={14} />
              {formatDuration(minutes)}
            </span>
          </div>

          <h2 className="text-[#012D1D] text-2xl font-bold mt-3">
            {draft.title || t("composer.review.untitledCourse")}
          </h2>
          <p className="text-[#414844] text-sm mt-2">
            {draft.shortDescription || t("composer.review.noShortDescription")}
          </p>

          <h3 className="text-[#012D1D] font-semibold mt-6">
            {t("composer.review.curriculumOverview")}
          </h3>
          <div className="flex flex-col gap-3 mt-3">
            {draft.sections.map((section, i) => {
              const sectionMinutes = section.lessons.reduce(
                (sum, l) => sum + (l.durationMinutes || 0),
                0,
              );
              return (
                <div
                  key={section.id}
                  className="flex items-center gap-3 border border-[#E5E7EB] rounded-lg px-4 py-3 bg-[#F9FAFB]"
                >
                  <span className="h-6 w-6 shrink-0 rounded-full bg-[#012D1D] text-white text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#191C1B] text-sm font-medium truncate">
                      {section.title || t("composer.review.untitledModule")}
                    </p>
                    <p className="text-[#6B7280] text-xs mt-0.5">
                      {t("composer.curriculum.lessonCount", {
                        count: section.lessons.length,
                      })}{" "}
                      • {formatDuration(sectionMinutes)}
                    </p>
                  </div>
                </div>
              );
            })}
            {!draft.sections.length && (
              <p className="text-[#6B7280] text-sm">
                {t("composer.review.noModules")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onEditCurriculum}
            className="text-[#267320] text-sm font-semibold mt-4 hover:underline cursor-pointer"
          >
            {t("composer.review.editCurriculum")}
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
          <h3 className="text-[#012D1D] font-semibold flex items-center gap-2">
            <FileCheck2 size={18} />
            {t("composer.review.checklist")}
          </h3>
          <ul className="flex flex-col gap-4 mt-4">
            {checklist.map((item) => (
              <li key={item.key} className="flex gap-3">
                {item.done ? (
                  <CheckCircle2
                    size={18}
                    className="text-[#267320] shrink-0 mt-0.5"
                  />
                ) : (
                  <Circle
                    size={18}
                    className="text-[#9CA3AF] shrink-0 mt-0.5"
                  />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      item.done ? "text-[#191C1B]" : "text-[#6B7280]"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[#6B7280] text-xs mt-0.5">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
          <p className="text-[#414844] text-xs">{t("composer.review.terms")}</p>
          <Button
            className="rounded-md! w-full mt-4 gap-2"
            disabled={saving || !canSubmit}
            onClick={onSubmit}
          >
            <SendHorizonal size={18} />
            {t("composer.review.submit")}
          </Button>
          <Button
            variant="outline"
            className="rounded-md! w-full mt-3"
            disabled={saving}
            onClick={onSaveDraft}
          >
            {t("composer.review.saveDraft")}
          </Button>
        </section>
      </aside>
    </div>
  );
};

export default StepReview;
