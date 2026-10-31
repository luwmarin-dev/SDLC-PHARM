import axios from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "../api/apiClient";
import type User from "@/types/user";

const useAuthor = (username: string) => {
  const [author, setAuthor] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(Boolean(username));

  const [loadedFor, setLoadedFor] = useState(username);
  if (loadedFor !== username) {
    setLoadedFor(username);
    setAuthor(null);
    setError(null);
    setLoading(Boolean(username));
  }

  useEffect(() => {
    if (!username) return;

    axiosInstance
      .get<User>(`/authors/${username}`)
      .then((res) => setAuthor(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  return { author, error, isLoading };
};

export default useAuthor;
