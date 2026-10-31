import { http, HttpResponse } from "msw";
import type User from "../../types/user";
import { endPoint } from "../../settings.json";
import users, { findUserById } from "../data/users";
import { ROLES } from "../../types/role";

export const roles = ROLES;

const fallbackUser = () => users[Math.floor(Math.random() * users.length)];

export const profile_handlers = [
  http.patch(`${endPoint}/profile/me`, async ({ request }) => {
    const body = (await request.json()) as Partial<User>;
    // The mock backend has no session, so the client sends the id it is editing.
    const base = (body.id && findUserById(body.id)) || fallbackUser();

    return HttpResponse.json<User>({
      ...base,
      username: body.username ?? base.username,
      displayName: body.displayName ?? base.displayName,
      bio: body.bio ?? base.bio,
      avatar: body.avatar ?? base.avatar,
      interests: body.interests ?? base.interests,
      region: body.region ?? base.region,
      languages: (body.languages as User["languages"]) ?? base.languages,
    });
  }),

  http.get<{ username: string }>(
    endPoint + "/authors/:username",
    ({ params }) => {
      const user = users.find((u) => u.username === params.username);
      if (!user) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      return HttpResponse.json<User>(user);
    },
  ),

  http.get<{ id: string }>(endPoint + "/profile/:id", ({ params }) => {
    const { id } = params;
    const user = findUserById(id as string) ?? fallbackUser();
    return HttpResponse.json<User>({ ...user, id: id as string });
  }),
];
