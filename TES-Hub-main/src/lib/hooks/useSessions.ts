import type Session from "@/types/session";
import useData from "./useData";

const useSessions = () => {
  const {
    data: sessions,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  } = useData<Session>("/sessions");

  return {
    sessions,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  };
};

export default useSessions;
