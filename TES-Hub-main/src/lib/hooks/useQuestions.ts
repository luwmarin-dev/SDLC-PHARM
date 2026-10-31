import type Question from "./../../types/question";
import useData from "./useData";

const useQuestions = () => {
  const {
    data: questions,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  } = useData<Question>("/questions");

  return {
    questions,
    error,
    isLoading,
    published,
    archived,
    draft,
    pending_review,
    rejected,
  };
};

export default useQuestions;
