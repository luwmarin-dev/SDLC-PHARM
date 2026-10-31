import {
  AlertCircle,
  CheckCircle2,
  Clock4,
  Target,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import useEnrollment from "@/lib/hooks/useEnrollment";
import useQuiz from "@/lib/hooks/useQuiz";
import useCourse from "@/lib/service/useCourse";
import type { PublicQuizQuestion, QuizAnswers } from "@/types/quiz";
import LearnShell from "./components/LearnShell";
import {
  EnrollGate,
  LearnLoading,
  LearnMessage,
} from "./components/LearnStates";
import ProgressBar from "./components/ProgressBar";

const hintKey: Record<PublicQuizQuestion["type"], string> = {
  single: "quiz.hintSingle",
  multiple: "quiz.hintMultiple",
  true_false: "quiz.hintTrueFalse",
};

const CourseQuiz = () => {
  const { slug = "", quizId = "" } = useParams();
  const { t } = useTranslation();

  const { course, error: courseError, isLoading } = useCourse(slug);
  const {
    enrollment,
    isEnrolled,
    isLoading: enrollmentLoading,
    isMutating,
    enroll,
    applyEnrollment,
  } = useEnrollment(slug);
  const {
    quiz,
    attempt,
    attemptsLeft,
    isLoading: quizLoading,
    isSubmitting,
    error: quizError,
    submit,
    reset,
  } = useQuiz(quizId);

  const [answers, setAnswers] = useState<QuizAnswers>({});

  const answeredCount = useMemo(
    () => Object.values(answers).filter((ids) => ids.length > 0).length,
    [answers],
  );

  if (isLoading || enrollmentLoading || quizLoading) return <LearnLoading />;

  if (courseError || !course) {
    return (
      <LearnMessage
        title={t("learn.loadError")}
        body={courseError ?? undefined}
        action={{ label: t("footer.courses"), to: "/academy/courses" }}
      />
    );
  }

  if (!quiz) {
    return (
      <LearnMessage
        title={t("quiz.notFound")}
        body={quizError ?? undefined}
        action={{
          label: t("lesson.backToOverview"),
          to: `/academy/courses/${slug}/learn`,
        }}
      />
    );
  }

  const lessonHref = quiz.lessonId
    ? `/academy/courses/${slug}/learn/${quiz.lessonId}`
    : `/academy/courses/${slug}/learn`;

  const toggleOption = (question: PublicQuizQuestion, optionId: string) => {
    setAnswers((current) => {
      const selected = current[question.id] ?? [];

      if (question.type === "multiple") {
        return {
          ...current,
          [question.id]: selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId],
        };
      }

      return { ...current, [question.id]: [optionId] };
    });
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(t("quiz.unansweredWarning", { count: unanswered }))
    ) {
      return;
    }
    submit(answers, applyEnrollment);
  };

  const handleRetake = () => {
    setAnswers({});
    reset();
  };

  const resultsByQuestion = new Map(
    (attempt?.results ?? []).map((result) => [result.questionId, result]),
  );

  return (
    <LearnShell
      course={course}
      enrollment={enrollment}
      activeLessonId={quiz.lessonId}
    >
      <div className="flex flex-col gap-6">
        <header className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#191C1B]">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="mt-3 text-[#414844]">{quiz.description}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#414844]">
            <span className="inline-flex items-center gap-2">
              <Target size={16} />
              {t("quiz.passMark", { percent: quiz.passScorePercent })}
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={16} />
              {t("common.questionCount", { count: quiz.questions.length })}
            </span>
            {quiz.timeLimitMinutes && (
              <span className="inline-flex items-center gap-2">
                <Clock4 size={16} />
                {t("quiz.timeLimit", { count: quiz.timeLimitMinutes })}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <AlertCircle size={16} />
              {quiz.maxAttempts
                ? t("quiz.attemptOf", {
                    used: Math.min(
                      quiz.attemptsUsed + (attempt ? 0 : 1),
                      quiz.maxAttempts,
                    ),
                    max: quiz.maxAttempts,
                  })
                : t("quiz.unlimitedAttempts")}
            </span>
          </div>
        </header>

        {!isEnrolled ? (
          <div className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
            <EnrollGate
              courseSlug={slug}
              onEnroll={enroll}
              isEnrolling={isMutating}
            />
          </div>
        ) : attempt ? (
          <>
            <section
              className={`rounded-xl border p-6 sm:p-8 ${
                attempt.passed
                  ? "border-[#A4F792] bg-[#EEFBEA]"
                  : "border-[#FFC9A3] bg-[#FFF6EE]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    attempt.passed ? "bg-[#A4F792]" : "bg-[#FFDCC3]"
                  }`}
                >
                  {attempt.passed ? (
                    <CheckCircle2 className="text-[#012D1D]" />
                  ) : (
                    <XCircle className="text-[#8A4A00]" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold text-[#191C1B]">
                    {attempt.passed
                      ? t("quiz.passedTitle")
                      : t("quiz.failedTitle")}
                  </h2>
                  <p className="mt-1 text-[#414844]">
                    {t("quiz.yourScore", { percent: attempt.scorePercent })} ·{" "}
                    {t("quiz.pointsEarned", {
                      earned: attempt.earnedPoints,
                      total: attempt.totalPoints,
                    })}
                  </p>
                </div>
              </div>

              <ProgressBar percent={attempt.scorePercent} className="mt-5" />

              <p className="mt-4 text-sm text-[#414844]">
                {attempt.passed
                  ? t("quiz.passedBody")
                  : t("quiz.failedBody", { percent: quiz.passScorePercent })}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {attempt.passed ? (
                  <Link to={lessonHref}>
                    <Button className="rounded-lg!">
                      {t("quiz.continueCourse")}
                    </Button>
                  </Link>
                ) : attemptsLeft === 0 ? (
                  <p className="text-sm font-medium text-[#8A4A00]">
                    {t("quiz.noAttemptsLeft")}
                  </p>
                ) : (
                  <Button className="rounded-lg!" onClick={handleRetake}>
                    {t("quiz.retake")}
                  </Button>
                )}
                <Link to={`/academy/courses/${slug}/learn`}>
                  <Button variant="outline" className="rounded-lg!">
                    {t("lesson.backToOverview")}
                  </Button>
                </Link>
              </div>
            </section>

            <section className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-[#191C1B]">
                {t("quiz.reviewTitle")}
              </h2>

              <ol className="mt-6 flex flex-col gap-6">
                {quiz.questions.map((question, index) => {
                  const result = resultsByQuestion.get(question.id);
                  const optionText = (id: string) =>
                    question.options.find((o) => o.id === id)?.text ?? id;

                  return (
                    <li
                      key={question.id}
                      className="rounded-lg border border-[#E1E6E1] p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            result?.isCorrect
                              ? "bg-[#1F6D1A] text-white"
                              : "bg-[#FFDCC3] text-[#8A4A00]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#191C1B]">
                            {question.prompt}
                          </p>
                          <p
                            className={`mt-2 text-sm font-semibold ${
                              result?.isCorrect
                                ? "text-[#1F6D1A]"
                                : "text-[#B01919]"
                            }`}
                          >
                            {result?.isCorrect
                              ? t("quiz.correct")
                              : t("quiz.incorrect")}
                          </p>

                          <dl className="mt-3 flex flex-col gap-2 text-sm">
                            <div className="flex flex-wrap gap-2">
                              <dt className="text-[#5C6660]">
                                {t("quiz.yourAnswer")}:
                              </dt>
                              <dd className="text-[#191C1B]">
                                {result?.selectedOptionIds.length
                                  ? result.selectedOptionIds
                                      .map(optionText)
                                      .join(", ")
                                  : t("quiz.noAnswer")}
                              </dd>
                            </div>
                            {!result?.isCorrect && (
                              <div className="flex flex-wrap gap-2">
                                <dt className="text-[#5C6660]">
                                  {t("quiz.correctAnswer")}:
                                </dt>
                                <dd className="font-medium text-[#1F6D1A]">
                                  {(result?.correctOptionIds ?? [])
                                    .map(optionText)
                                    .join(", ")}
                                </dd>
                              </div>
                            )}
                          </dl>

                          {result?.explanation && (
                            <p className="mt-3 rounded-md bg-[#F4F7F4] px-4 py-3 text-sm text-[#414844]">
                              <span className="font-semibold">
                                {t("quiz.explanation")}:{" "}
                              </span>
                              {result.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#414844]">
                  {t("quiz.answeredCount", {
                    answered: answeredCount,
                    total: quiz.questions.length,
                  })}
                </p>
                {attemptsLeft !== undefined && (
                  <p className="text-sm text-[#5C6660]">
                    {t("quiz.attemptsLeft", { count: attemptsLeft })}
                  </p>
                )}
              </div>
              <ProgressBar
                percent={(answeredCount / quiz.questions.length) * 100}
                className="mt-3"
              />
            </section>

            {attemptsLeft === 0 ? (
              <div className="rounded-xl border border-[#FFC9A3] bg-[#FFF6EE] p-6 text-[#8A4A00]">
                {t("quiz.noAttemptsLeft")}
              </div>
            ) : (
              <ol className="flex flex-col gap-5">
                {quiz.questions.map((question, index) => {
                  const selected = answers[question.id] ?? [];
                  const isMultiple = question.type === "multiple";

                  return (
                    <li
                      key={question.id}
                      className="rounded-xl border border-[#C1C8C2] bg-white p-6 sm:p-8"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#5C6660]">
                          {t("quiz.questionOf", {
                            index: index + 1,
                            total: quiz.questions.length,
                          })}
                        </p>
                        <p className="text-xs text-[#5C6660]">
                          {t("quiz.points", { count: question.points })}
                        </p>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-[#191C1B]">
                        {question.prompt}
                      </h2>
                      <p className="mt-1 text-sm text-[#5C6660]">
                        {t(hintKey[question.type])}
                      </p>

                      <fieldset className="mt-4 flex flex-col gap-3">
                        <legend className="sr-only">{question.prompt}</legend>
                        {question.options.map((option) => {
                          const checked = selected.includes(option.id);

                          return (
                            <label
                              key={option.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                                checked
                                  ? "border-[#1F6D1A] bg-[#EEF6EE]"
                                  : "border-[#E1E6E1] hover:border-[#C1C8C2]"
                              }`}
                            >
                              <input
                                type={isMultiple ? "checkbox" : "radio"}
                                name={question.id}
                                value={option.id}
                                checked={checked}
                                onChange={() =>
                                  toggleOption(question, option.id)
                                }
                                className="h-4 w-4 accent-[#1F6D1A]"
                              />
                              <span className="text-[#191C1B]">
                                {option.text}
                              </span>
                            </label>
                          );
                        })}
                      </fieldset>
                    </li>
                  );
                })}
              </ol>
            )}

            {quizError && (
              <p className="rounded-md bg-[#FEE2E2] px-4 py-3 text-sm text-[#B01919]">
                {quizError}
              </p>
            )}

            {attemptsLeft !== 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="rounded-lg!"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("quiz.submitting") : t("quiz.submit")}
                </Button>
                <Link to={lessonHref}>
                  <Button variant="outline" className="rounded-lg!">
                    {t("common.cancel")}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </LearnShell>
  );
};

export default CourseQuiz;
