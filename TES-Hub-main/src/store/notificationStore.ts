import { create } from "zustand";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/service/notificationsApi";
import { messageOf } from "../lib/utils/errors";
import type Notification from "../types/notification";

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  /** The user the current list belongs to, so we refetch when the account changes. */
  loadedFor: string | null;

  load: (userId: string | undefined, force?: boolean) => Promise<void>;
  markRead: (id: string, isRead?: boolean) => Promise<void>;
  markAllRead: (userId: string | undefined) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  loadedFor: null,

  load: async (userId, force = false) => {
    // Guests have no inbox: clear whatever the previous account left behind.
    if (!userId) {
      set({
        notifications: [],
        isLoading: false,
        error: null,
        loadedFor: null,
      });
      return;
    }

    const { loadedFor, isLoading } = get();
    if (isLoading) return;
    if (!force && loadedFor === userId) return;

    set({ isLoading: true, error: null });
    try {
      set({
        notifications: await fetchNotifications(userId),
        loadedFor: userId,
      });
    } catch (error) {
      set({ error: messageOf(error, "Could not load your notifications.") });
    } finally {
      set({ isLoading: false });
    }
  },

  markRead: async (id, isRead = true) => {
    const previous = get().notifications;
    const current = previous.find((n) => n.id === id);
    if (!current || current.isRead === isRead) return;

    // Optimistic so the header badge reacts on click.
    set({
      notifications: previous.map((n) => (n.id === id ? { ...n, isRead } : n)),
    });
    try {
      const updated = await markNotificationRead(id, isRead);
      set({
        notifications: get().notifications.map((n) =>
          n.id === id ? updated : n,
        ),
      });
    } catch (error) {
      set({
        notifications: previous,
        error: messageOf(error, "Could not update the notification."),
      });
    }
  },

  markAllRead: async (userId) => {
    const previous = get().notifications;
    if (!previous.some((n) => !n.isRead)) return;

    set({ notifications: previous.map((n) => ({ ...n, isRead: true })) });
    try {
      set({ notifications: await markAllNotificationsRead(userId) });
    } catch (error) {
      set({
        notifications: previous,
        error: messageOf(error, "Could not update your notifications."),
      });
    }
  },

  remove: async (id) => {
    const previous = get().notifications;
    set({ notifications: previous.filter((n) => n.id !== id) });
    try {
      await deleteNotification(id);
    } catch (error) {
      set({
        notifications: previous,
        error: messageOf(error, "Could not remove the notification."),
      });
    }
  },

  reset: () =>
    set({
      notifications: [],
      isLoading: false,
      error: null,
      loadedFor: null,
    }),
}));
