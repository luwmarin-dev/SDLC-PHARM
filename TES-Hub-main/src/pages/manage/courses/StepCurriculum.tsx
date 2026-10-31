import { cn } from "@/lib/utils";
import type CourseSection from "@/types/course-section";
import type Lesson from "@/types/lesson";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  HelpCircle,
  Link2,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { inputClass } from "./composerUI";
import {
  formatDuration,
  LESSON_TYPE_KEYS,
  newLesson,
  newSection,
} from "./courseDraft";

const LESSON_ICONS: Record<Lesson["type"], typeof Video> = {
  video: Video,
  article: FileText,
  pdf: FileText,
  quiz: HelpCircle,
  external_link: Link2,
};

interface DragPayload {
  sectionId: string;
  lessonId?: string;
}

interface Props {
  sections: CourseSection[];
  onChange: (sections: CourseSection[]) => void;
  error?: string;
}

const StepCurriculum = ({ sections, onChange, error }: Props) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [renaming, setRenaming] = useState<string | null>(null);
  const drag = useRef<DragPayload | null>(null);

  const patchSection = (id: string, patch: Partial<CourseSection>) =>
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const patchLesson = (
    sectionId: string,
    lessonId: string,
    patch: Partial<Lesson>,
  ) =>
    onChange(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...patch } : l,
              ),
            }
          : s,
      ),
    );

  const addSection = () =>
    onChange([...sections, newSection(sections.length + 1)]);

  const removeSection = (id: string) =>
    onChange(sections.filter((s) => s.id !== id));

  const addLesson = (sectionId: string) =>
    onChange(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, newLesson(s.lessons.length + 1)] }
          : s,
      ),
    );

  const removeLesson = (sectionId: string, lessonId: string) =>
    onChange(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s,
      ),
    );

  function moveSection(fromId: string, toId: string) {
    if (fromId === toId) return;
    const from = sections.findIndex((s) => s.id === fromId);
    const to = sections.findIndex((s) => s.id === toId);
    if (from === -1 || to === -1) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function moveLesson(source: DragPayload, target: DragPayload) {
    if (!source.lessonId) return;
    if (source.lessonId === target.lessonId) return;

    const fromSection = sections.find((s) => s.id === source.sectionId);
    const lesson = fromSection?.lessons.find((l) => l.id === source.lessonId);
    if (!lesson) return;

    const next = sections.map((s) =>
      s.id === source.sectionId
        ? { ...s, lessons: s.lessons.filter((l) => l.id !== source.lessonId) }
        : s,
    );

    const targetIndex = next.findIndex((s) => s.id === target.sectionId);
    if (targetIndex === -1) return;

    const targetLessons = [...next[targetIndex].lessons];
    const at = target.lessonId
      ? targetLessons.findIndex((l) => l.id === target.lessonId)
      : targetLessons.length;
    targetLessons.splice(at === -1 ? targetLessons.length : at, 0, lesson);
    next[targetIndex] = { ...next[targetIndex], lessons: targetLessons };

    onChange(next);
  }

  function handleDrop(target: DragPayload) {
    const source = drag.current;
    drag.current = null;
    if (!source) return;
    if (source.lessonId) moveLesson(source, target);
    else if (!target.lessonId) moveSection(source.sectionId, target.sectionId);
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {sections.map((section, index) => {
        const minutes = section.lessons.reduce(
          (sum, l) => sum + (l.durationMinutes || 0),
          0,
        );
        const isCollapsed = collapsed[section.id];

        return (
          <div
            key={section.id}
            draggable={renaming !== section.id}
            onDragStart={() => (drag.current = { sectionId: section.id })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop({ sectionId: section.id })}
            className="border border-[#C1C8C2] rounded-xl bg-white overflow-hidden"
          >
            <div className="flex items-center gap-3 bg-[#F2F7F3] px-4 py-4 border-b border-[#C1C8C2]">
              <GripVertical
                size={18}
                className="text-[#9CA3AF] cursor-grab shrink-0"
              />
              <div className="flex-1 min-w-0">
                {renaming === section.id ? (
                  <input
                    autoFocus
                    className={inputClass}
                    value={section.title}
                    onChange={(e) =>
                      patchSection(section.id, { title: e.target.value })
                    }
                    onBlur={() => setRenaming(null)}
                    onKeyDown={(e) => e.key === "Enter" && setRenaming(null)}
                    placeholder={t("composer.curriculum.modulePlaceholder")}
                  />
                ) : (
                  <>
                    <h3 className="text-[#012D1D] font-semibold truncate">
                      {section.title
                        ? t("composer.curriculum.moduleWithTitle", {
                            number: index + 1,
                            title: section.title,
                          })
                        : t("composer.curriculum.module", {
                            number: index + 1,
                          })}
                    </h3>
                    <p className="text-[#414844] text-xs mt-0.5">
                      {t("composer.curriculum.lessonCount", {
                        count: section.lessons.length,
                      })}{" "}
                      • {formatDuration(minutes)}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label={t("composer.curriculum.renameModule")}
                onClick={() =>
                  setRenaming(renaming === section.id ? null : section.id)
                }
                className="p-2 rounded-md text-[#414844] hover:bg-[#E2EAE4] cursor-pointer"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                aria-label={t("composer.curriculum.deleteModule")}
                onClick={() => removeSection(section.id)}
                className="p-2 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                aria-label={
                  isCollapsed
                    ? t("composer.curriculum.expandModule")
                    : t("composer.curriculum.collapseModule")
                }
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))
                }
                className="p-2 rounded-md text-[#414844] hover:bg-[#E2EAE4] cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
            </div>

            {!isCollapsed && (
              <div className="p-4 flex flex-col gap-3">
                {section.lessons.map((lesson) => {
                  const Icon = LESSON_ICONS[lesson.type];
                  return (
                    <div
                      key={lesson.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        drag.current = {
                          sectionId: section.id,
                          lessonId: lesson.id,
                        };
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDrop({
                          sectionId: section.id,
                          lessonId: lesson.id,
                        });
                      }}
                      className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical
                          size={16}
                          className="text-[#9CA3AF] cursor-grab shrink-0"
                        />
                        <span className="h-8 w-8 shrink-0 rounded-md bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                          <Icon size={16} />
                        </span>
                        <input
                          className={`${inputClass} flex-1`}
                          value={lesson.title}
                          onChange={(e) =>
                            patchLesson(section.id, lesson.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder={t("composer.curriculum.lessonTitle")}
                        />
                        <button
                          type="button"
                          aria-label={t("composer.curriculum.deleteLesson")}
                          onClick={() => removeLesson(section.id, lesson.id)}
                          className="p-2 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pl-11">
                        <select
                          aria-label={t("composer.curriculum.lessonType")}
                          className={cn(inputClass, "w-40")}
                          value={lesson.type}
                          onChange={(e) =>
                            patchLesson(section.id, lesson.id, {
                              type: e.target.value as Lesson["type"],
                            })
                          }
                        >
                          {(
                            Object.keys(LESSON_TYPE_KEYS) as Lesson["type"][]
                          ).map((type) => (
                            <option key={type} value={type}>
                              {t(LESSON_TYPE_KEYS[type])}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm text-[#414844]">
                          <input
                            type="number"
                            min={0}
                            className={cn(inputClass, "w-24")}
                            value={lesson.durationMinutes}
                            onChange={(e) =>
                              patchLesson(section.id, lesson.id, {
                                durationMinutes: Number(e.target.value),
                              })
                            }
                          />
                          {t("composer.curriculum.minutes")}
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[#414844]">
                          <input
                            type="checkbox"
                            checked={lesson.isFreePreview}
                            onChange={(e) =>
                              patchLesson(section.id, lesson.id, {
                                isFreePreview: e.target.checked,
                              })
                            }
                          />
                          {t("composer.curriculum.freePreview")}
                        </label>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => addLesson(section.id)}
                  className="self-start flex items-center gap-2 border border-[#C1C8C2] rounded-md px-3 py-2 text-sm text-[#414844] hover:border-[#012D1D] hover:text-[#012D1D] cursor-pointer"
                >
                  <Plus size={16} />
                  {t("composer.curriculum.addLesson")}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addSection}
        className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#C1C8C2] rounded-xl py-8 text-sm text-[#414844] hover:border-[#012D1D] hover:text-[#012D1D] cursor-pointer"
      >
        <Plus size={20} />
        {t("composer.curriculum.addModule")}
      </button>
    </div>
  );
};

export default StepCurriculum;
