import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contact_handlers = [
  http.post(`${endPoint}/contact`, async ({ request }) => {
    const body = (await request.json()) as ContactMessage;

    return HttpResponse.json({
      id: crypto.randomUUID(),
      status: "received",
      receivedAt: new Date().toISOString(),
      ...body,
    });
  }),
];
