import {
  Bell,
  BellOff,
  BookOpen,
  CheckCheck,
  MessageSquare,
  ShoppingBag,
  TriangleAlert,
  X,
} from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import StyledContainer from "../../components/layout/StyledContainer";
import useNotifications from "../../lib/hooks/useNotifications";
import type Notification from "../../types/notification";

const TYPE_META = {
  content: { Icon: BookOpen, className: "bg-[#E0F2FE] text-[#0369A1]" },
  social: { Icon: MessageSquare, className: "bg-[#DCFCE7] text-[#15803D]" },
  commerce: { Icon: ShoppingBag, className: "bg-[#FEF3C7] text-[#B45309]" },
  system: { Icon: TriangleAlert, className: "bg-[#F3E8FF] text-[#7E22CE]" },
} as const;

type Filter = "all" | "unread" | Notification["type"];

const FILTERS: Filter[] = [
  "all",
  "unread",
  "content",
  "social",
  "commerce",
  "system",
];

const NotificationRow = ({
  notification,
  onOpen,
  onToggleRead,
  onRemove,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  onToggleRead: (notification: Notification) => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const { Icon, className } = TYPE_META[notification.type];

  return (
    <li
      className={`flex items-start gap-4 rounded-xl border border-[#C1C8C2] p-4 transition-colors ${
        notification.isRead ? "bg-white" : "bg-[#F1F7F3]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${className}`}
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {notification.link ? (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              className="cursor-pointer text-left text-sm font-semibold text-[#191C1B] hover:underline"
            >
              {notification.title}
            </button>
          ) : (
            <p className="text-sm font-semibold text-[#191C1B]">
              {notification.title}
            </p>
          )}
          {!notification.isRead && (
            <span
              aria-label={t("notifications.unread")}
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1F7A4D]"
            />
          )}
        </div>

        <p className="mt-1 text-sm break-words text-[#414844]">
          {notification.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-4">
          <time
            dateTime={notification.createdAt}
            className="text-xs text-[#6B7280]"
          >
            {moment(notification.createdAt).fromNow()}
          </time>
          <button
            type="button"
            onClick={() => onToggleRead(notification)}
            className="cursor-pointer text-xs font-semibold text-[#012D1D] hover:underline"
          >
            {notification.isRead
              ? t("notifications.markUnread")
              : t("notifications.markRead")}
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={t("notifications.remove")}
        onClick={() => onRemove(notification.id)}
        className="shrink-0 cursor-pointer text-[#6B7280] hover:text-[#BA1A1A]"
      >
        <X size={16} />
      </button>
    </li>
  );
};

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();

  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const openNotification = (notification: Notification) => {
    void markRead(notification.id, true);
    if (notification.link) navigate(notification.link);
  };

  return (
    <StyledContainer className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-[#012D1D]">
            <Bell size={26} />
            {t("notifications.title")}
          </h1>
          <p className="mt-1 text-[#414844]">
            {unreadCount > 0
              ? t("notifications.unreadCount", { count: unreadCount })
              : t("notifications.allCaughtUp")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-[#C1C8C2] px-4 py-2 text-sm font-semibold text-[#191C1B] hover:bg-[#F2F4F2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={16} />
          {t("notifications.markAllRead")}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === value
                ? "bg-[#012D1D] text-white"
                : "border border-[#C1C8C2] text-[#414844] hover:bg-[#F2F4F2]"
            }`}
          >
            {t(`notifications.filter.${value}`)}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-[#BA1A1A]">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-8 text-[#414844]">{t("common.loading")}</p>
      ) : visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#C1C8C2] bg-white py-16 text-center">
          <BellOff size={36} className="text-[#9CA3AF]" />
          <p className="font-semibold text-[#191C1B]">
            {t("notifications.emptyTitle")}
          </p>
          <p className="max-w-sm text-sm text-[#414844]">
            {t("notifications.emptyText")}
          </p>
          <Link
            to="/sessions"
            className="mt-2 text-sm font-semibold text-[#012D1D] underline"
          >
            {t("notifications.browseSessions")}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onOpen={openNotification}
              onToggleRead={(n) => void markRead(n.id, !n.isRead)}
              onRemove={(id) => void remove(id)}
            />
          ))}
        </ul>
      )}
    </StyledContainer>
  );
};

export default Notifications;
