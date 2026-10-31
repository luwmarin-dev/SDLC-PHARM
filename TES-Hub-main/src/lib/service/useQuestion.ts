import type Question from "@/types/question";
import useContent from "./useContent";

const useQuestion = (slug: string) => {
  const {
    content: question,
    error,
    isLoading,
  } = useContent<Question>("/questions", slug);

  return { question, error, isLoading };
};

export default useQuestion;
