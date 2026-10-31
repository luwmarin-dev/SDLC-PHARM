export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: "single" | "multiple" | "true_false";
  options: QuizOption[];
  correctOptionIds: string[];
  explanation?: string;
  points: number;
}

export default interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  passScorePercent: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  questions: QuizQuestion[];
}

export type PublicQuizQuestion = Omit<
  QuizQuestion,
  "correctOptionIds" | "explanation"
>;

export interface PublicQuiz extends Omit<Quiz, "questions"> {
  questions: PublicQuizQuestion[];
  attemptsUsed: number;
}

export interface QuizQuestionResult {
  questionId: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  submittedAt: string;
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean;
  results: QuizQuestionResult[];
}

export type QuizAnswers = Record<string, string[]>;
