import type Story from "@/types/story";
import useContent from "./useContent";

const useStory = (slug: string) => {
  const { content: story, error, isLoading } = useContent<Story>("/stories", slug);

  return { story, error, isLoading };
};

export default useStory;
