import { setupWorker } from "msw/browser";
import { auth_handlers } from "./handlers/auth";
import { profile_handlers } from "./handlers/profile";
import { content_handlers } from "./handlers/content";
import { contact_handlers } from "./handlers/contact";
import { handlers } from "./handlers/user";
import { learning_handlers } from "./handlers/learning";
import { settings_handlers } from "./handlers/settings";
import { admin_handlers } from "./handlers/admin";
import { notification_handlers } from "./handlers/notifications";
import { session_handlers } from "./handlers/sessions";

export const worker = setupWorker(
  ...handlers,
  ...auth_handlers,
  ...profile_handlers,
  // Registered before content_handlers so the session sub-routes
  // (/register, /checkout, /registration) win over the generic CRUD routes.
  ...session_handlers,
  ...content_handlers,
  ...contact_handlers,
  ...learning_handlers,
  ...settings_handlers,
  ...admin_handlers,
  ...notification_handlers,
);
