import useContent from "./useContent";
import type Article from "@/types/article";

const useArticle = (slug: string) => {
  const {
    content: article,
    error,
    isLoading,
  } = useContent<Article>("/articles", slug);

  return { article, error, isLoading };
};

export default useArticle;
