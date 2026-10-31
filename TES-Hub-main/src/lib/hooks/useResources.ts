import axios from "axios";
import { useEffect, useState } from "react";
import { fetchResources, trackResourceDownload } from "../service/learningApi";
import type Resource from "@/types/resource";

const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchResources()
      .then((data) => active && setResources(data))
      .catch((err) => {
        if (!active) return;
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? err.message)
            : "Unexpected error.",
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const registerDownload = (id: string) => {
    setResources((current) =>
      current.map((resource) =>
        resource.id === id
          ? { ...resource, downloadCount: resource.downloadCount + 1 }
          : resource,
      ),
    );
    trackResourceDownload(id).catch(() => {});
  };

  return { resources, isLoading, error, registerDownload };
};

export default useResources;
