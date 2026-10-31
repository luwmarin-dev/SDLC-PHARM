import type Session from "@/types/session";
import type { MaterialKind, SessionFormat, SessionType } from "@/types/session";

export type SessionLifecycle = "live" | "upcoming" | "completed" | "canceled";

export function getLifecycle(
  s: Pick<Session, "startsAt" | "endsAt" | "isCanceled">,
  now: number = Date.now(),
): SessionLifecycle {
  if (s.isCanceled) return "canceled";
  const start = new Date(s.startsAt).getTime();
  const end = new Date(s.endsAt).getTime();
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "completed";
}

export const SESSION_TYPE_KEYS: Record<SessionType, string> = {
  webinar: "session.type.webinar",
  workshop: "session.type.workshop",
  field_day: "session.type.field_day",
  clinic: "session.type.clinic",
  recorded_course: "session.type.recorded_course",
};

export const SESSION_FORMAT_KEYS: Record<SessionFormat, string> = {
  online: "session.format.online",
  onsite: "session.format.onsite",
  hybrid: "session.format.hybrid",
};

export const MATERIAL_KIND_KEYS: Record<MaterialKind, string> = {
  pdf: "session.material.pdf",
  excel: "session.material.excel",
  video: "session.material.video",
  link: "session.material.link",
};

export function capacityPercent(registered: number, capacity: number) {
  if (!capacity) return 0;
  return Math.min(100, Math.round((registered / capacity) * 100));
}

export function priceLabel(
  pricing: Session["pricing"],
  t: (key: string) => string,
) {
  if (pricing.model === "free" || !pricing.amount) return t("session.free");
  return `${pricing.amount} ${pricing.currency}`;
}

export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isSameDay(iso: string, ref: Date = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export type RegistrationBlock =
  | "canceled"
  | "ended"
  | "closed"
  | "full"
  | null;

/**
 * Single source of truth for "can somebody still take a seat?".
 * Mirrors the guard in the mock backend so the button state and the API agree.
 * Order matters: the most specific reason wins so the label is never misleading.
 */
export function registrationBlock(
  session: Pick<
    Session,
    | "isCanceled"
    | "startsAt"
    | "endsAt"
    | "registrationClosesAt"
    | "capacity"
    | "registeredCount"
  >,
  now: number = Date.now(),
): RegistrationBlock {
  if (session.isCanceled) return "canceled";
  if (Date.parse(session.endsAt) < now) return "ended";
  if (
    session.registrationClosesAt &&
    Date.parse(session.registrationClosesAt) < now
  )
    return "closed";
  if (session.capacity > 0 && session.registeredCount >= session.capacity)
    return "full";
  return null;
}

export const REGISTRATION_BLOCK_KEYS: Record<
  Exclude<RegistrationBlock, null>,
  string
> = {
  canceled: "session.detail.register.canceled",
  ended: "session.detail.register.ended",
  closed: "session.detail.register.closed",
  full: "session.detail.register.full",
};

export function spotsLeft(session: Pick<Session, "capacity" | "registeredCount">) {
  return Math.max(0, session.capacity - session.registeredCount);
}
