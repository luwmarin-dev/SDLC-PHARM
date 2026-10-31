import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import notifications, { notificationsFor } from "../data/notifications";
import type Notification from "../../types/notification";

const GUEST_ID = "user-member-1";

const userIdFrom = (request: Request) =>
  new URL(request.url).searchParams.get("userId") || GUEST_ID;

const notFound = () =>
  HttpResponse.json({ message: "Not found." }, { status: 404 });

export const notification_handlers = [
  http.get(`${endPoint}/notifications`, ({ request }) => {
    const url = new URL(request.url);
    const list = notificationsFor(userIdFrom(request));
    const unreadOnly = url.searchParams.get("unread") === "true";

    return HttpResponse.json<Notification[]>(
      unreadOnly ? list.filter((n) => !n.isRead) : list,
    );
  }),

  http.patch<{ id: string }>(
    `${endPoint}/notifications/:id/read`,
    async ({ params, request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        isRead?: boolean;
      };
      const notification = notifications.find((n) => n.id === params.id);
      if (!notification) return notFound();

      notification.isRead = body.isRead ?? true;
      return HttpResponse.json<Notification>(notification);
    },
  ),

  http.post(`${endPoint}/notifications/read-all`, ({ request }) => {
    const userId = userIdFrom(request);
    notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    return HttpResponse.json<Notification[]>(notificationsFor(userId));
  }),

  http.delete<{ id: string }>(`${endPoint}/notifications/:id`, ({ params }) => {
    const index = notifications.findIndex((n) => n.id === params.id);
    if (index === -1) return notFound();
    const [removed] = notifications.splice(index, 1);
    return HttpResponse.json<Notification>(removed);
  }),
];
