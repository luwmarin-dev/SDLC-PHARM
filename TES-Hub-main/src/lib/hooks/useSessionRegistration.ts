import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import {
  cancelRegistration,
  fetchRegistration,
  payForSession,
  registerForSession,
} from "../service/registrationsApi";
import { useNotificationStore } from "../../store/notificationStore";
import { messageOf, statusOf } from "../utils/errors";
import type Registration from "@/types/registration";
import type { AttendeeDetails } from "@/types/registration";

const useSessionRegistration = (slug: string) => {
  const user = useAuth();
  const userId = user?.id;
  const reloadNotifications = useNotificationStore((state) => state.load);

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setLoading] = useState(Boolean(slug && userId));
  const [isMutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !userId) {
      setRegistration(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchRegistration(slug, userId)
      .then((data) => active && setRegistration(data))
      .catch((err) => {
        if (!active) return;
        // 404 simply means "not registered yet" — not an error worth showing.
        if (statusOf(err) === 404) setRegistration(null);
        else setError(messageOf(err, "Could not load your registration."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, userId]);

  /** The mock backend pushes a notification per action; keep the inbox in sync. */
  const syncInbox = useCallback(
    () => void reloadNotifications(userId, true),
    [reloadNotifications, userId],
  );

  const register = useCallback(
    async (attendee: AttendeeDetails) => {
      setMutating(true);
      setError(null);
      try {
        const data = await registerForSession(slug, { ...attendee, userId });
        setRegistration(data);
        syncInbox();
        return data;
      } catch (err) {
        setError(messageOf(err, "Registration failed."));
        return null;
      } finally {
        setMutating(false);
      }
    },
    [slug, userId, syncInbox],
  );

  const pay = useCallback(async () => {
    setMutating(true);
    setError(null);
    try {
      const data = await payForSession(slug, userId);
      setRegistration(data);
      syncInbox();
      return data;
    } catch (err) {
      setError(messageOf(err, "Payment failed."));
      return null;
    } finally {
      setMutating(false);
    }
  }, [slug, userId, syncInbox]);

  const cancel = useCallback(async () => {
    setMutating(true);
    setError(null);
    try {
      await cancelRegistration(slug, userId);
      setRegistration(null);
      syncInbox();
      return true;
    } catch (err) {
      setError(messageOf(err, "Could not cancel your registration."));
      return false;
    } finally {
      setMutating(false);
    }
  }, [slug, userId, syncInbox]);

  return {
    registration,
    isRegistered: Boolean(registration),
    needsPayment: registration?.paymentStatus === "pending",
    isConfirmed:
      registration?.paymentStatus === "free" ||
      registration?.paymentStatus === "paid",
    isLoading,
    isMutating,
    error,
    register,
    pay,
    cancel,
  };
};

export default useSessionRegistration;
