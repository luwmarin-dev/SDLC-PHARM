import { useMemo } from "react";
import { useToastStore, type ToastInput } from "../../store/toastStore";

/**
 * Stable toast API for components. The returned object is memoised so it is
 * safe to list in a `useEffect`/`useCallback` dependency array.
 */
const useToast = () => {
  const push = useToastStore((state) => state.push);
  const dismiss = useToastStore((state) => state.dismiss);

  return useMemo(
    () => ({
      toast: (input: ToastInput) => push(input),
      success: (title: string, description?: string) =>
        push({ tone: "success", title, description }),
      error: (title: string, description?: string) =>
        push({ tone: "error", title, description }),
      info: (title: string, description?: string) =>
        push({ tone: "info", title, description }),
      dismiss,
    }),
    [push, dismiss],
  );
};

export default useToast;
