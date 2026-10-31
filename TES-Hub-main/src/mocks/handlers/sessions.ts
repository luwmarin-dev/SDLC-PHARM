import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import sessions from "../data/sessions";
import registrations, { findRegistration } from "../data/registrations";
import { addNotification } from "../data/notifications";
import type Registration from "../../types/registration";
import type { AttendeeDetails } from "../../types/registration";
import type Session from "../../types/session";

const GUEST_ID = "user-member-1";

const userIdFrom = (request: Request) =>
  new URL(request.url).searchParams.get("userId") || GUEST_ID;

const notFound = (message = "Not found.") =>
  HttpResponse.json({ message }, { status: 404 });

const badRequest = (message: string, status = 400) =>
  HttpResponse.json({ message }, { status });

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const sessionBySlug = (slug: string) => sessions.find((s) => s.slug === slug);

const isPaid = (session: Session) =>
  session.pricing.model !== "free" && Boolean(session.pricing.amount);

/**
 * Mirrors the guard the UI applies on the session detail page, so a stale tab
 * or a direct POST cannot register for a session that is no longer open.
 */
const registrationBlocker = (session: Session): string | null => {
  if (session.isCanceled) return "This session has been canceled.";
  if (session.status !== "published") return "This session is not open yet.";
  if (Date.parse(session.endsAt) < Date.now())
    return "This session has already ended.";
  if (
    session.registrationClosesAt &&
    Date.parse(session.registrationClosesAt) < Date.now()
  )
    return "Registration for this session is closed.";
  if (session.capacity > 0 && session.registeredCount >= session.capacity)
    return "This session is full.";
  return null;
};

const readAttendee = (input: Partial<AttendeeDetails>): AttendeeDetails | null => {
  const fullName = input.fullName?.trim();
  const email = input.email?.trim();
  const phone = input.phone?.trim();
  if (!fullName || !email || !phone) return null;
  return { fullName, email, phone, notes: input.notes?.trim() || undefined };
};

interface RegisterBody extends Partial<AttendeeDetails> {
  userId?: string;
}

export const session_handlers = [
  http.get<{ slug: string }>(
    `${endPoint}/sessions/:slug/registration`,
    ({ params, request }) => {
      const session = sessionBySlug(params.slug);
      if (!session) return notFound();

      const registration = findRegistration(userIdFrom(request), session.id);
      if (!registration) return notFound("Not registered.");

      return HttpResponse.json<Registration>(registration);
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/sessions/:slug/register`,
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as RegisterBody;
      const userId = body.userId || GUEST_ID;

      const session = sessionBySlug(params.slug);
      if (!session) return notFound();

      if (findRegistration(userId, session.id)) {
        return badRequest("You are already registered for this session.", 409);
      }

      const blocker = registrationBlocker(session);
      if (blocker) return badRequest(blocker);

      const attendee = readAttendee(body);
      if (!attendee) {
        return badRequest("Full name, email and phone are required.", 422);
      }

      const paid = isPaid(session);
      const registration: Registration = {
        id: uid("reg"),
        userId,
        sessionId: session.id,
        sessionSlug: session.slug,
        registeredAt: new Date().toISOString(),
        // Paid sessions only hold the seat until checkout completes.
        paymentStatus: paid ? "pending" : "free",
        checkInStatus: "not_checked_in",
        attendee,
      };

      registrations.push(registration);
      session.registeredCount += 1;
      session.updatedAt = new Date().toISOString();

      addNotification({
        userId,
        type: "commerce",
        title: paid
          ? `Seat held for ${session.title}`
          : `You're registered for ${session.title}`,
        body: paid
          ? "Complete the payment to confirm your seat."
          : "We saved your spot. Joining details are on the session page.",
        link: `/sessions/${session.slug}`,
      });

      return HttpResponse.json<Registration>(registration, { status: 201 });
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/sessions/:slug/checkout`,
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        userId?: string;
      };
      const userId = body.userId || GUEST_ID;

      const session = sessionBySlug(params.slug);
      if (!session) return notFound();

      const registration = findRegistration(userId, session.id);
      if (!registration) return notFound("Not registered.");

      if (registration.paymentStatus === "paid") {
        return HttpResponse.json<Registration>(registration);
      }
      if (registration.paymentStatus !== "pending") {
        return badRequest("This registration does not require payment.");
      }

      registration.paymentStatus = "paid";
      registration.paymentId = uid("pay");

      addNotification({
        userId,
        type: "commerce",
        title: `Payment confirmed for ${session.title}`,
        body: "Your seat is confirmed. See you there!",
        link: `/sessions/${session.slug}`,
      });

      return HttpResponse.json<Registration>(registration);
    },
  ),

  http.delete<{ slug: string }>(
    `${endPoint}/sessions/:slug/register`,
    ({ params, request }) => {
      const session = sessionBySlug(params.slug);
      if (!session) return notFound();

      const userId = userIdFrom(request);
      const index = registrations.findIndex(
        (r) => r.userId === userId && r.sessionId === session.id,
      );
      if (index === -1) return notFound("Not registered.");

      const [removed] = registrations.splice(index, 1);
      session.registeredCount = Math.max(0, session.registeredCount - 1);
      session.updatedAt = new Date().toISOString();

      addNotification({
        userId,
        type: "commerce",
        title: `Registration canceled for ${session.title}`,
        body: "Your spot has been released.",
        link: `/sessions/${session.slug}`,
      });

      return HttpResponse.json<Registration>(removed);
    },
  ),
];
