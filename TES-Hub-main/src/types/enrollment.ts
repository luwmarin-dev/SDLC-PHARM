export interface EnrollmentQuizState {
  bestScorePercent: number;
  passed: boolean;
  attempts: number;
}

export default interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercent: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastAccessedAt?: string;
  completedAt?: string;
  certificateId?: string;
  quizState?: Record<string, EnrollmentQuizState>;
}
