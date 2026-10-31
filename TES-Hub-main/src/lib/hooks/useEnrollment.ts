import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import {
  enrollInCourse,
  fetchEnrollment,
  setLessonProgress,
} from "../service/learningApi";
import type Enrollment from "@/types/enrollment";

const messageOf = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) return err.response?.data?.message ?? err.message;
  if (err instanceof Error) return err.message;
  return fallback;
};

const useEnrollment = (slug: string) => {
  const user = useAuth();
  const userId = user?.id;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setLoading] = useState(Boolean(slug));
  const [isMutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    setLoading(true);

    fetchEnrollment(slug, userId)
      .then((data) => active && setEnrollment(data))
      .catch((err) => {
        if (!active) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setEnrollment(null);
        } else {
          setError(messageOf(err, "Could not load your progress."));
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug, userId]);

  const enroll = useCallback(async () => {
    setMutating(true);
    setError(null);
    try {
      const data = await enrollInCourse(slug, userId);
      setEnrollment(data);
      return data;
    } catch (err) {
      setError(messageOf(err, "Enrollment failed."));
      return null;
    } finally {
      setMutating(false);
    }
  }, [slug, userId]);

  const setLessonComplete = useCallback(
    async (lessonId: string, completed: boolean) => {
      setMutating(true);
      setError(null);
      try {
        const data = await setLessonProgress(slug, {
          lessonId,
          completed,
          userId,
        });
        setEnrollment(data);
        return data;
      } catch (err) {
        setError(messageOf(err, "Could not save your progress."));
        return null;
      } finally {
        setMutating(false);
      }
    },
    [slug, userId],
  );

  return {
    enrollment,
    isEnrolled: Boolean(enrollment),
    isLoading,
    isMutating,
    error,
    enroll,
    setLessonComplete,
    applyEnrollment: setEnrollment,
  };
};

export default useEnrollment;
