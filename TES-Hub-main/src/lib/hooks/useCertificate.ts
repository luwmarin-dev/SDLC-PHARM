import axios from "axios";
import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import { fetchCertificate } from "../service/learningApi";
import type Certificate from "@/types/certificate";

interface NotReady {
  progressPercent: number;
  requiredPercent: number;
}

const useCertificate = (slug: string) => {
  const user = useAuth();
  const userId = user?.id;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [notReady, setNotReady] = useState<NotReady | null>(null);
  const [isEnrolled, setEnrolled] = useState(true);
  const [isLoading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let active = true;
    setLoading(true);

    fetchCertificate(slug, userId)
      .then((data) => {
        if (!active) return;
        setCertificate(data);
        setNotReady(null);
      })
      .catch((err) => {
        if (!active) return;
        if (!axios.isAxiosError(err)) {
          setError(err instanceof Error ? err.message : "Unexpected error.");
          return;
        }
        if (err.response?.status === 409) {
          setNotReady({
            progressPercent: err.response.data?.progressPercent ?? 0,
            requiredPercent: err.response.data?.requiredPercent ?? 100,
          });
        } else if (err.response?.status === 404) {
          setEnrolled(false);
        } else {
          setError(err.response?.data?.message ?? err.message);
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug, userId]);

  return { certificate, notReady, isEnrolled, isLoading, error };
};

export default useCertificate;
