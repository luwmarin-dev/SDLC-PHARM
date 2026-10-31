export const PAYMENT_STATUSES = [
  "free",
  "paid",
  "pending",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const CHECK_IN_STATUSES = [
  "not_checked_in",
  "checked_in",
  "no_show",
] as const;
export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];

/** Attendee details collected by the session registration form. */
export interface AttendeeDetails {
  fullName: string;
  email: string;
  phone: string;
  /** Free-text accessibility needs, dietary notes, questions for the host. */
  notes?: string;
}

export default interface Registration {
  id: string;
  userId: string;
  sessionId: string;
  sessionSlug: string;
  registeredAt: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  checkInStatus: CheckInStatus;
  checkInAt?: string;
  attendee: AttendeeDetails;
}
