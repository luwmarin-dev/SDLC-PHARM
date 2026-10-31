import type Course from "./../../types/course";
import useData from "./useData";

const useCourses = () => {
  const {
    data: courses,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  } = useData<Course>("/courses");

  return {
    courses,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  };
};

export default useCourses;
