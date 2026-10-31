import { useEffect, useState } from "react";
import axiosInstance from "../api/apiClient";
import { messageOf } from "../utils/errors";

const useContent = <T,>(endpoint: string, slug: string) => {
  const [content, setContent] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(Boolean(slug));

  useEffect(() => {
    if (!slug) {
      setContent(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Reset per request: without this, navigating between two items keeps the
    // previous item (or its error) on screen while the new one is in flight.
    let active = true;
    setLoading(true);
    setError(null);
    setContent(null);

    axiosInstance
      .get<T>(`${endpoint}/${slug}`)
      .then((res) => active && setContent(res.data))
      .catch((err) => {
        if (!active) return;
        setError(messageOf(err, "An unexpected error occurred."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Guards against a slow response for a previous slug overwriting the
    // current one when the user navigates quickly.
    return () => {
      active = false;
    };
  }, [endpoint, slug]);

  return { content, error, isLoading };
};

export default useContent;
