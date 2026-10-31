import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import type UserSettings from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";

// Settings live in memory for the lifetime of the tab: the mock backend has no
// database, but reloading the same tab should not lose what the user just saved.
const store = new Map<string, UserSettings>();

const readSettings = (id: string): UserSettings =>
  store.get(id) ?? DEFAULT_SETTINGS;

interface SettingsPatch extends Partial<UserSettings> {
  id?: string;
}

export const settings_handlers = [
  http.get(`${endPoint}/settings/me`, ({ request }) => {
    const id = new URL(request.url).searchParams.get("id") ?? "me";
    return HttpResponse.json<UserSettings>(readSettings(id));
  }),

  http.patch(`${endPoint}/settings/me`, async ({ request }) => {
    const body = (await request.json()) as SettingsPatch;
    const id = body.id ?? "me";
    const current = readSettings(id);

    const next: UserSettings = {
      contentLanguages: body.contentLanguages ?? current.contentLanguages,
      notifications: { ...current.notifications, ...body.notifications },
      privacy: { ...current.privacy, ...body.privacy },
    };

    store.set(id, next);
    return HttpResponse.json<UserSettings>(next);
  }),

  http.post(`${endPoint}/settings/password`, async ({ request }) => {
    const body = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
    };

    if (body.currentPassword === body.newPassword) {
      return HttpResponse.json(
        { message: "The new password must differ from the current one." },
        { status: 400 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(
    `${endPoint}/profile/me`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
