import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ExternalLink,
  FileDown,
  FileQuestion,
  Info,
} from "lucide-react";
import Button from "@/components/ui/button";
import sanitize from "@/lib/sanitize";
import type Lesson from "@/types/lesson";
import type { EnrollmentQuizState } from "@/types/enrollment";
import { formatFileSize } from "./lessonMeta";

interface Props {
  lesson: Lesson;
  courseSlug: string;
  quizState?: EnrollmentQuizState;
}

const LessonContent = ({ lesson, courseSlug, quizState }: Props) => {
  const { t } = useTranslation();
  const [showTranscript, setShowTranscript] = useState(false);
  const content = lesson.content;

  if (!content) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#E1E6E1] bg-[#F7F9F7] p-6 text-[#414844]">
        <Info size={18} className="shrink-0" />
        <p>{t("lesson.contentComing")}</p>
      </div>
    );
  }

  if (content.kind === "article") {
    return (
      <article
        className="prose max-w-none text-[#26302B] prose-headings:text-[#191C1B] prose-a:text-[#1F6D1A] prose-blockquote:border-l-[#1F6D1A] prose-blockquote:bg-[#F4F7F4] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
        dangerouslySetInnerHTML={{ __html: sanitize(content.body) }}
      />
    );
  }

  if (content.kind === "video") {
    return (
      <div className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-xl bg-black">
          <video
            controls
            playsInline
            poster={content.poster}
            src={content.url}
            className="aspect-video w-full"
          >
            {t("lesson.videoUnsupported")}
          </video>
        </div>

        {content.transcript && (
          <div className="rounded-lg border border-[#E1E6E1] bg-white">
            <button
              type="button"
              aria-expanded={showTranscript}
              onClick={() => setShowTranscript((open) => !open)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-[#191C1B] cursor-pointer"
            >
              {t("lesson.transcript")}
              <ChevronDown
                size={18}
                className={`text-[#414844] transition-transform ${
                  showTranscript ? "rotate-180" : ""
                }`}
              />
            </button>
            {showTranscript && (
              <p className="border-t border-[#E1E6E1] px-5 py-4 leading-relaxed text-[#414844]">
                {content.transcript}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (content.kind === "pdf") {
    return (
      <div className="flex flex-col gap-4">
        {content.summary && (
          <p className="leading-relaxed text-[#414844]">{content.summary}</p>
        )}
        <div className="overflow-hidden rounded-xl border border-[#C1C8C2] bg-white">
          <object
            data={content.url}
            type="application/pdf"
            className="h-[600px] w-full"
            aria-label={content.fileName}
          >
            <div className="flex flex-col items-center gap-4 p-10 text-center">
              <FileDown size={32} className="text-[#8A4A00]" />
              <p className="text-[#414844]">
                {t("lesson.pdfMeta", {
                  name: content.fileName,
                  size: formatFileSize(content.sizeKb),
                })}
              </p>
            </div>
          </object>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E6E1] px-5 py-4">
            <p className="text-sm text-[#414844]">
              {t("lesson.pdfMeta", {
                name: content.fileName,
                size: formatFileSize(content.sizeKb),
              })}
            </p>
            <a href={content.url} download={content.fileName}>
              <Button
                className="rounded-lg! py-2!"
                Icon={FileDown}
                iconStyles="mr-2 w-4"
              >
                {t("lesson.downloadPdf")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (content.kind === "external_link") {
    return (
      <div className="rounded-xl border border-[#C1C8C2] bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#E9ECEA]">
          <ExternalLink className="text-[#414844]" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[#191C1B]">
          {t("lesson.externalTitle")}
        </h2>
        {content.summary && (
          <p className="mx-auto mt-3 max-w-md text-[#414844]">
            {content.summary}
          </p>
        )}
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block"
        >
          <Button
            className="rounded-lg!"
            Icon={ExternalLink}
            iconStyles="mr-2 w-4"
          >
            {t("lesson.externalOpen")}
          </Button>
        </a>
        <p className="mt-4 text-xs text-[#5C6660]">
          {t("lesson.externalNotice")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#C1C8C2] bg-white p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F1E7FF]">
        <FileQuestion className="text-[#5B2E9E]" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[#191C1B]">
        {t("lesson.quizTitle")}
      </h2>
      {lesson.summary && (
        <p className="mx-auto mt-3 max-w-md text-[#414844]">{lesson.summary}</p>
      )}

      {quizState && quizState.attempts > 0 && (
        <p
          className={`mt-4 text-sm font-semibold ${
            quizState.passed ? "text-[#1F6D1A]" : "text-[#8A4A00]"
          }`}
        >
          {quizState.passed
            ? t("lesson.quizPassed", { percent: quizState.bestScorePercent })
            : t("lesson.quizFailed", { percent: quizState.bestScorePercent })}
        </p>
      )}

      <Link
        to={`/academy/courses/${courseSlug}/quiz/${content.quizId}`}
        className="mt-6 inline-block"
      >
        <Button className="rounded-lg!">
          {quizState?.attempts ? t("lesson.retakeQuiz") : t("lesson.startQuiz")}
        </Button>
      </Link>
    </div>
  );
};

export default LessonContent;
