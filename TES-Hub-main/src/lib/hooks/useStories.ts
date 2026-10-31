import type Story from "./../../types/story";
import useData from "./useData";

const useStories = () => {
  const {
    data: stories,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  } = useData<Story>("/stories");

  return {
    stories,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  };
};

export default useStories;
