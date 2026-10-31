import useData from "./useData";
import type Article from "./../../types/article";

const useArticles = () => {
  const {
    data: articles,
    archived,
    draft,
    error,
    isLoading,
    pending_review,
    published,
    rejected,
  } = useData<Article>("/articles");

  return {
    articles,
    archived,
    draft,
    error,
    isLoading,
    pending_review,
    published,
    rejected,
  };
};

export default useArticles;
