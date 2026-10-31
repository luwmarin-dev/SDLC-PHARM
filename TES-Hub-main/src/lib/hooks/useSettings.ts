import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/apiClient";
import type UserSettings from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";

type Patch = Partial<UserSettings>;

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    axiosInstance
      .get<UserSettings>("/settings/me", { params: { id: userId } })
      .then((res) => {
        if (active) setSettings(res.data);
      })
      .catch(() => {
        if (active) setSettings(DEFAULT_SETTINGS);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const save = useCallback(
    async (patch: Patch) => {
      const res = await axiosInstance.patch<UserSettings>("/settings/me", {
        id: userId,
        ...patch,
      });
      setSettings(res.data);
      return res.data;
    },
    [userId],
  );

  return { settings, loading, save };
}

export default useSettings;
