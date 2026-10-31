import useContent from "./useContent";
import type Session from "@/types/session";

const useSession = (slug: string) => {
  const {
    content: session,
    error,
    isLoading,
  } = useContent<Session>("/sessions", slug);

  return { session, error, isLoading };
};

export default useSession;
