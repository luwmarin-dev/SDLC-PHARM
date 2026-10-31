import type Notification from "../../types/notification";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const now = Date.now();
const ago = (offsetMs: number) => new Date(now - offsetMs).toISOString();

// Seeded for the demo account used across the mock backend.
const notifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-member-1",
    type: "social",
    title: "Gulnara Isakova replied to your question",
    body: "“Leaf spots that early usually point to early blight — check the lower leaves first.”",
    link: "/community/questions/tomato-leaf-spots",
    isRead: false,
    createdAt: ago(35 * MINUTE),
  },
  {
    id: "notif-2",
    userId: "user-member-1",
    type: "commerce",
    title: "Your spot in Soil Health Workshop is confirmed",
    body: "The session starts soon. Joining details are on the session page.",
    link: "/sessions/soil-health-workshop",
    isRead: false,
    createdAt: ago(5 * HOUR),
  },
  {
    id: "notif-3",
    userId: "user-member-1",
    type: "content",
    title: "New article in Crop Production",
    body: "“Reading a soil test report” was published by the TES Academy team.",
    link: "/academy/articles",
    isRead: true,
    createdAt: ago(2 * DAY),
  },
  {
    id: "notif-4",
    userId: "user-member-1",
    type: "system",
    title: "Verify your email address",
    body: "Confirm your email to unlock certificates and paid sessions.",
    link: "/settings",
    isRead: true,
    createdAt: ago(6 * DAY),
  },
];

export const notificationsFor = (userId: string) =>
  notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

export const addNotification = (
  input: Omit<Notification, "id" | "isRead" | "createdAt"> &
    Partial<Pick<Notification, "isRead" | "createdAt">>,
): Notification => {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  notifications.push(notification);
  return notification;
};

export default notifications;
