import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import users from "../data/users";

const data = users.map((u) => {
  const [name, ...rest] = u.displayName.split(" ");
  return { id: u.id, name, lastName: rest.join(" ") };
});

export const handlers = [
  http.get(endPoint + "/api/users", () => {
    return HttpResponse.json(data);
  }),
];
