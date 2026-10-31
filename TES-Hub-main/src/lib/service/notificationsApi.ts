import axiosInstance from "../api/apiClient";
import type Notification from "@/types/notification";

export const fetchNotifications = (userId?: string) =>
  axiosInstance
    .get<Notification[]>("/notifications", { params: { userId } })
    .then((r) => r.data);

export const markNotificationRead = (id: string, isRead = true) =>
  axiosInstance
    .patch<Notification>(`/notifications/${id}/read`, { isRead })
    .then((r) => r.data);

export const markAllNotificationsRead = (userId?: string) =>
  axiosInstance
    .post<Notification[]>("/notifications/read-all", null, {
      params: { userId },
    })
    .then((r) => r.data);

export const deleteNotification = (id: string) =>
  axiosInstance
    .delete<Notification>(`/notifications/${id}`)
    .then((r) => r.data);
