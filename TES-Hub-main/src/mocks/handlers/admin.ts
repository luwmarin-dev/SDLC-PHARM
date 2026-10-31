import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import flags from "../data/flags";
import users from "../data/users";
import type Flag from "../../types/flag";
import type User from "../../types/user";
import type { Role } from "../../types/role";

// Admin actions mutate copies held in memory: the mock backend has no database,
// but changes should survive navigation inside the same tab.
const flagState: Flag[] = flags.map((flag) => ({ ...flag }));
const userState: User[] = users.map((user) => ({ ...user }));

export const admin_handlers = [
  http.get(`${endPoint}/admin/flags`, () =>
    HttpResponse.json<Flag[]>(flagState),
  ),

  http.patch<{ id: string }>(
    `${endPoint}/admin/flags/:id`,
    async ({ params, request }) => {
      const body = (await request.json()) as { status: Flag["status"] };
      const flag = flagState.find((f) => f.id === params.id);

      if (!flag) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }

      flag.status = body.status;
      return HttpResponse.json<Flag>(flag);
    },
  ),

  http.get(`${endPoint}/admin/users`, () =>
    HttpResponse.json<User[]>(userState),
  ),

  http.patch<{ id: string }>(
    `${endPoint}/admin/users/:id`,
    async ({ params, request }) => {
      const body = (await request.json()) as {
        role?: Role;
        isBanned?: boolean;
      };
      const user = userState.find((u) => u.id === params.id);

      if (!user) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }

      if (body.role !== undefined) user.role = body.role;
      if (body.isBanned !== undefined) user.isBanned = body.isBanned;

      return HttpResponse.json<User>(user);
    },
  ),
];
