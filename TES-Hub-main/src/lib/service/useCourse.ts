import useContent from "./useContent";
import type Course from "./../../types/course";

const useCourse = (slug: string) => {
  const { content: course, error, isLoading } = useContent<Course>("/courses", slug);

  return { course, error, isLoading };
};

export default useCourse;
