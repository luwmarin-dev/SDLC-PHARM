import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import { fetchQuiz, submitQuizAttempt } from "../service/learningApi";
import type Enrollment from "@/types/enrollment";
import type { PublicQuiz, QuizAnswers, QuizAttempt } from "@/types/quiz";

const messageOf = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) return err.response?.data?.message ?? err.message;
  if (err instanceof Error) return err.message;
  return fallback;
};

const useQuiz = (quizId: string) => {
  const user = useAuth();
  const userId = user?.id;

  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setLoading] = useState(Boolean(quizId));
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;

    let active = true;
    setLoading(true);

    fetchQuiz(quizId, userId)
      .then((data) => active && setQuiz(data))
      .catch((err) => active && setError(messageOf(err, "Quiz unavailable.")))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [quizId, userId]);

  const submit = useCallback(
    async (
      answers: QuizAnswers,
      onEnrollment?: (enrollment: Enrollment) => void,
    ) => {
      setSubmitting(true);
      setError(null);
      try {
        const data = await submitQuizAttempt(quizId, { answers, userId });
        setAttempt(data.attempt);
        setQuiz((current) =>
          current
            ? { ...current, attemptsUsed: data.attempt.attemptNumber }
            : current,
        );
        onEnrollment?.(data.enrollment);
        return data.attempt;
      } catch (err) {
        setError(messageOf(err, "Could not submit your answers."));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [quizId, userId],
  );

  const attemptsLeft =
    quiz?.maxAttempts === undefined
      ? undefined
      : Math.max(0, quiz.maxAttempts - quiz.attemptsUsed);

  return {
    quiz,
    attempt,
    attemptsLeft,
    isLoading,
    isSubmitting,
    error,
    submit,
    reset: () => setAttempt(null),
  };
};

export default useQuiz;
