import type Session from "@/types/session";
import type { EntityStatus } from "@/types/status";
import {
  capacityPercent,
  getLifecycle,
  SESSION_TYPE_KEYS,
  type SessionLifecycle,
} from "@/lib/utils/session";
import {
  CalendarDays,
  MonitorPlay,
  Sprout,
  Stethoscope,
  Video,
} from "lucide-react";
import type { SessionType } from "@/types/session";
import { useTranslation } from "react-i18next";

interface BadgeStyle {
  bg: string;
  text: string;
  dot: string;
  labelKey: string;
}

export const MODERATION_STYLES: Record<EntityStatus, BadgeStyle> = {
  published: {
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#22C55E]",
    labelKey: "status.published",
  },
  draft: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#4B5563]",
    dot: "bg-[#9CA3AF]",
    labelKey: "status.draft",
  },
  archived: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#DC2626]",
    dot: "bg-[#EF4444]",
    labelKey: "status.archived",
  },
  pending_review: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#B45309]",
    dot: "bg-[#F59E0B]",
    labelKey: "status.pending_review",
  },
  rejected: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#B91C1C]",
    dot: "bg-[#DC2626]",
    labelKey: "status.rejected",
  },
};

export const LIFECYCLE_STYLES: Record<SessionLifecycle, BadgeStyle> = {
  live: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#DC2626]",
    dot: "bg-[#EF4444] animate-pulse",
    labelKey: "session.lifecycle.live",
  },
  upcoming: {
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#22C55E]",
    labelKey: "session.lifecycle.upcoming",
  },
  completed: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#4B5563]",
    dot: "bg-[#9CA3AF]",
    labelKey: "session.lifecycle.completed",
  },
  canceled: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#6B7280]",
    dot: "bg-[#9CA3AF]",
    labelKey: "session.lifecycle.canceled",
  },
};

const Pill = ({ style }: { style: BadgeStyle }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {t(style.labelKey)}
    </span>
  );
};

export const SessionStatusBadge = ({ session }: { session: Session }) => {
  if (session.isCanceled) return <Pill style={LIFECYCLE_STYLES.canceled} />;
  if (session.status === "published") {
    return <Pill style={LIFECYCLE_STYLES[getLifecycle(session)]} />;
  }
  return <Pill style={MODERATION_STYLES[session.status]} />;
};

export const StatusBadge = ({ status }: { status: EntityStatus }) => (
  <Pill style={MODERATION_STYLES[status] ?? MODERATION_STYLES.draft} />
);

export const SESSION_TYPE_ICONS: Record<SessionType, typeof Video> = {
  webinar: MonitorPlay,
  workshop: CalendarDays,
  field_day: Sprout,
  clinic: Stethoscope,
  recorded_course: Video,
};

export const SessionTypeLabel = ({ type }: { type: SessionType }) => {
  const { t } = useTranslation();
  const Icon = SESSION_TYPE_ICONS[type] ?? MonitorPlay;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] mt-1">
      <Icon size={14} />
      {t(SESSION_TYPE_KEYS[type])}
    </span>
  );
};

interface CapacityProps {
  registered: number;
  capacity: number;
  canceled?: boolean;
  className?: string;
}

export const CapacityMeter = ({
  registered,
  capacity,
  canceled,
  className = "w-28",
}: CapacityProps) => {
  const { t } = useTranslation();
  const percent = capacityPercent(registered, capacity);
  const isFull = percent >= 100;
  const isAlmostFull = percent >= 85;

  const barColor = canceled
    ? "bg-[#9CA3AF]"
    : isFull
      ? "bg-[#DC2626]"
      : isAlmostFull
        ? "bg-[#F48C24]"
        : "bg-[#012D1D]";

  const textColor = canceled
    ? "text-[#9CA3AF]"
    : isFull
      ? "text-[#DC2626]"
      : isAlmostFull
        ? "text-[#F48C24]"
        : "text-[#012D1D]";

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={textColor}>
          {registered}/{capacity}
        </span>
        <span className={textColor}>
          {isFull ? t("session.full") : `${percent}%`}
        </span>
      </div>
      <div className="w-full rounded-xl bg-[#E6E9E7] h-2 overflow-hidden mt-1.5">
        <div
          className={`h-2 rounded-xl transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
