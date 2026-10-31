import axiosInstance from "../api/apiClient";
import type Certificate from "@/types/certificate";
import type Enrollment from "@/types/enrollment";
import type Resource from "@/types/resource";
import type { PublicQuiz, QuizAnswers, QuizAttempt } from "@/types/quiz";

const scope = (userId?: string) => ({ params: userId ? { userId } : undefined });

export const fetchEnrollments = (userId?: string) =>
  axiosInstance
    .get<Enrollment[]>("/enrollments", scope(userId))
    .then((r) => r.data);

export const fetchEnrollment = (slug: string, userId?: string) =>
  axiosInstance
    .get<Enrollment>(`/courses/${slug}/enrollment`, scope(userId))
    .then((r) => r.data);

export const enrollInCourse = (slug: string, userId?: string) =>
  axiosInstance
    .post<Enrollment>(`/courses/${slug}/enroll`, { userId })
    .then((r) => r.data);

export const setLessonProgress = (
  slug: string,
  payload: { lessonId: string; completed: boolean; userId?: string },
) =>
  axiosInstance
    .post<Enrollment>(`/courses/${slug}/progress`, payload)
    .then((r) => r.data);

export const fetchQuiz = (quizId: string, userId?: string) =>
  axiosInstance
    .get<PublicQuiz>(`/quizzes/${quizId}`, scope(userId))
    .then((r) => r.data);

export const submitQuizAttempt = (
  quizId: string,
  payload: { answers: QuizAnswers; userId?: string },
) =>
  axiosInstance
    .post<{ attempt: QuizAttempt; enrollment: Enrollment }>(
      `/quizzes/${quizId}/attempts`,
      payload,
    )
    .then((r) => r.data);

export const fetchCertificate = (slug: string, userId?: string) =>
  axiosInstance
    .get<Certificate>(`/courses/${slug}/certificate`, scope(userId))
    .then((r) => r.data);

export const verifyCertificate = (code: string) =>
  axiosInstance
    .get<Certificate>(`/certificates/verify/${code}`)
    .then((r) => r.data);

export const fetchResources = () =>
  axiosInstance.get<Resource[]>("/resources").then((r) => r.data);

export const trackResourceDownload = (id: string) =>
  axiosInstance.post<Resource>(`/resources/${id}/download`).then((r) => r.data);
