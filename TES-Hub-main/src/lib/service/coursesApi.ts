import axiosInstance from "../api/apiClient";
import type Course from "@/types/course";
import type { EntityStatus } from "@/types/status";

export type CourseDraftPayload = Partial<Course>;

export const createCourse = (payload: CourseDraftPayload) =>
  axiosInstance.post<Course>("/courses", payload).then((r) => r.data);

export const updateCourse = (slug: string, payload: CourseDraftPayload) =>
  axiosInstance.patch<Course>(`/courses/${slug}`, payload).then((r) => r.data);

export const setCourseStatus = (slug: string, status: EntityStatus) =>
  axiosInstance
    .patch<Course>(`/courses/${slug}/status`, { status })
    .then((r) => r.data);

export const deleteCourse = (slug: string) =>
  axiosInstance.delete<Course>(`/courses/${slug}`).then((r) => r.data);
