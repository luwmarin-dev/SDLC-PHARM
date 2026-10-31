import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../api/apiClient";
import { messageOf } from "../utils/errors";
import type User from "../../types/user";

/**
 * Loads a user profile. The sentinel id "me" resolves to the signed-in user
 * from the auth store instead of hitting the API.
 */
export function useUser(id: string) {
  const auth = useAuthStore((state) => state.user);
  const isSelf = id === "me";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!isSelf && Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSelf || !id) return;

    let active = true;
    // Reset on id change so the previous profile never shows under a new id.
    setLoading(true);
    setError(null);
    setUser(null);

    axiosInstance
      .get<User>(`/profile/${id}`)
      .then((res) => active && setUser(res.data))
      .catch((err) => {
        if (!active) return;
        setError(messageOf(err, "Could not load this profile."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isSelf]);

  if (isSelf) {
    // The auth store hydrates synchronously from localStorage, so a missing
    // user here means "signed out", not "still loading".
    return { user: auth, loading: false, error: null };
  }

  return { user, loading, error };
}
