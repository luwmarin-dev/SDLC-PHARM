import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import useAuth from "./useAuth";
import { useNotificationStore } from "../../store/notificationStore";

/**
 * Subscribes a component to the shared notification inbox and makes sure it is
 * loaded for the signed-in user. Safe to call from several components at once:
 * the store de-duplicates the request.
 */
const useNotifications = () => {
  const user = useAuth();
  const userId = user?.id;

  const { notifications, isLoading, error } = useNotificationStore(
    useShallow((state) => ({
      notifications: state.notifications,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );

  const load = useNotificationStore((state) => state.load);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const remove = useNotificationStore((state) => state.remove);

  useEffect(() => {
    void load(userId);
  }, [userId, load]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    isLoading,
    error,
    refresh: () => load(userId, true),
    markRead,
    markAllRead: () => markAllRead(userId),
    remove,
  };
};

export default useNotifications;
