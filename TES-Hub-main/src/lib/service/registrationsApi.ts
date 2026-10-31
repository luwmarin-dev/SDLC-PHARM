import axiosInstance from "../api/apiClient";
import type Registration from "@/types/registration";
import type { AttendeeDetails } from "@/types/registration";

export const fetchRegistration = (slug: string, userId?: string) =>
  axiosInstance
    .get<Registration>(`/sessions/${slug}/registration`, { params: { userId } })
    .then((r) => r.data);

export const registerForSession = (
  slug: string,
  payload: AttendeeDetails & { userId?: string },
) =>
  axiosInstance
    .post<Registration>(`/sessions/${slug}/register`, payload)
    .then((r) => r.data);

export const payForSession = (slug: string, userId?: string) =>
  axiosInstance
    .post<Registration>(`/sessions/${slug}/checkout`, { userId })
    .then((r) => r.data);

export const cancelRegistration = (slug: string, userId?: string) =>
  axiosInstance
    .delete<Registration>(`/sessions/${slug}/register`, { params: { userId } })
    .then((r) => r.data);
