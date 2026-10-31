import type Enrollment from "../../types/enrollment";

const enrollments: Enrollment[] = [
  {
    id: "enr-verified-farmer-soil-health",
    userId: "user-verified-farmer-1",
    courseId: "course-soil-health-fundamentals",
    enrolledAt: "2026-01-20T08:00:00.000Z",
    progressPercent: 100,
    completedLessonIds: ["les-1", "les-2", "les-3", "les-4", "les-5", "les-6"],
    lastLessonId: "les-6",
    lastAccessedAt: "2026-02-14T10:30:00.000Z",
    completedAt: "2026-02-14T10:30:00.000Z",
    certificateId: "cert-soil-health-verified-farmer",
    quizState: {
      "quiz-soil-health-final": {
        bestScorePercent: 88,
        passed: true,
        attempts: 2,
      },
    },
  },
  {
    id: "enr-member-soil-health",
    userId: "user-member-1",
    courseId: "course-soil-health-fundamentals",
    enrolledAt: "2026-06-02T07:15:00.000Z",
    progressPercent: 33,
    completedLessonIds: ["les-1", "les-2"],
    lastLessonId: "les-3",
    lastAccessedAt: "2026-06-09T19:05:00.000Z",
    quizState: {},
  },
];

export const findEnrollment = (userId: string, courseId: string) =>
  enrollments.find((e) => e.userId === userId && e.courseId === courseId);

export default enrollments;
