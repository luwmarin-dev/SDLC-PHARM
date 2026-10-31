import axiosInstance from "../api/apiClient";
import type Session from "@/types/session";
import type { EntityStatus } from "@/types/status";

export type SessionDraft = Partial<Session>;

export const createSession = (payload: SessionDraft) =>
  axiosInstance.post<Session>("/sessions", payload).then((r) => r.data);

export const updateSession = (slug: string, payload: SessionDraft) =>
  axiosInstance
    .patch<Session>(`/sessions/${slug}`, payload)
    .then((r) => r.data);

export const setSessionStatus = (slug: string, status: EntityStatus) =>
  axiosInstance
    .patch<Session>(`/sessions/${slug}/status`, { status })
    .then((r) => r.data);

export const cancelSession = (slug: string) =>
  axiosInstance.post<Session>(`/sessions/${slug}/cancel`).then((r) => r.data);

export const restoreSession = (slug: string) =>
  axiosInstance.post<Session>(`/sessions/${slug}/restore`).then((r) => r.data);

export const deleteSession = (slug: string) =>
  axiosInstance.delete<Session>(`/sessions/${slug}`).then((r) => r.data);
