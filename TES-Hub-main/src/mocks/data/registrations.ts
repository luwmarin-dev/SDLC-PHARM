import type Registration from "../../types/registration";

const registrations: Registration[] = [];

export const findRegistration = (userId: string, sessionId: string) =>
  registrations.find(
    (r) => r.userId === userId && r.sessionId === sessionId,
  );

export const registrationsFor = (userId: string) =>
  registrations.filter((r) => r.userId === userId);

export default registrations;
