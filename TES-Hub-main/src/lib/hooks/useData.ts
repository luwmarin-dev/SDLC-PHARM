import { useEffect, useState } from "react";
import axiosInstance from "../api/apiClient";
import { messageOf } from "../utils/errors";
import type { Status } from "@/types/status";

const useData = <T extends Status>(route: string) => {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    axiosInstance
      .get<T[]>(route)
      .then((res) => {
        if (!active) return;
        setData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!active) return;
        setError(messageOf(err, "An unexpected error occurred."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Stops a stale response for a previous route from landing in state.
    return () => {
      active = false;
    };
  }, [route]);

  const published = data?.filter((d) => d.status === "published");
  const archived = data?.filter((d) => d.status === "archived");
  const draft = data?.filter((d) => d.status === "draft");
  const pending_review = data?.filter((d) => d.status === "pending_review");
  const rejected = data?.filter((d) => d.status === "rejected");

  return {
    data,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  };
};

export default useData;
