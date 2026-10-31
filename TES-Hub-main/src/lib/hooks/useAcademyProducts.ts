import type Article from "@/types/article";
import type Course from "@/types/course";
import useArticles from "./useArticles";
import useCourses from "./useCourses";

export type AcademyProduct = Article | Course;

const useAcademyProducts = () => {
  const {
    published: publishedCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();
  const {
    published: publishedArticles,
    isLoading: articlesLoading,
    error: articlesError,
  } = useArticles();

  const products: AcademyProduct[] = [
    ...(publishedCourses ?? []),
    ...(publishedArticles ?? []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    products,
    isLoading: coursesLoading || articlesLoading,
    error: coursesError ?? articlesError,
  };
};

export default useAcademyProducts;
