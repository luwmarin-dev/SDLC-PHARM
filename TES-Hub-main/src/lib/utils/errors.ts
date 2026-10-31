import axios from "axios";

/**
 * Normalises anything thrown by an axios call into a message safe to show.
 * Prefers the mock/real backend's `{ message }` payload over the transport error.
 */
export const messageOf = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
