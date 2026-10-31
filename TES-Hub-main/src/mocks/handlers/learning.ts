import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import courses from "../data/courses";
import quizzes from "../data/quizzes";
import enrollments from "../data/enrollments";
import certificates from "../data/certificates";
import resources from "../data/resources";
import { findUserById } from "../data/users";
import type Course from "../../types/course";
import type Enrollment from "../../types/enrollment";
import type Certificate from "../../types/certificate";
import type Quiz from "../../types/quiz";
import type {
  PublicQuiz,
  QuizAnswers,
  QuizAttempt,
  QuizQuestionResult,
} from "../../types/quiz";

const GUEST_ID = "user-member-1";

const notFound = (message = "Not found.") =>
  HttpResponse.json({ message }, { status: 404 });

const userIdFrom = (request: Request) =>
  new URL(request.url).searchParams.get("userId") || GUEST_ID;

const courseBySlug = (slug: string) => courses.find((c) => c.slug === slug);

const allLessons = (course: Course) =>
  [...course.sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((section) =>
      [...section.lessons].sort((a, b) => a.order - b.order),
    );

const quizIdForLesson = (course: Course, lessonId: string) => {
  const lesson = allLessons(course).find((l) => l.id === lessonId);
  return lesson?.content?.kind === "quiz" ? lesson.content.quizId : undefined;
};

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const verificationCode = (course: Course) => {
  const initials = course.title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TES-${initials || "TES"}-${new Date().getFullYear()}-${random}`;
};

const newEnrollment = (userId: string, course: Course): Enrollment => ({
  id: uid("enr"),
  userId,
  courseId: course.id,
  enrolledAt: new Date().toISOString(),
  progressPercent: 0,
  completedLessonIds: [],
  lastLessonId: allLessons(course)[0]?.id,
  lastAccessedAt: new Date().toISOString(),
  quizState: {},
});

const syncProgress = (enrollment: Enrollment, course: Course) => {
  const lessons = allLessons(course);
  const total = lessons.length;
  const done = lessons.filter((l) =>
    enrollment.completedLessonIds.includes(l.id),
  ).length;

  enrollment.progressPercent = total ? Math.round((done / total) * 100) : 0;
  enrollment.lastAccessedAt = new Date().toISOString();

  const threshold = course.completionThresholdPercent ?? 100;

  if (enrollment.progressPercent < threshold) {
    enrollment.completedAt = undefined;
    return enrollment;
  }

  enrollment.completedAt ??= new Date().toISOString();

  if (course.certificateTemplate && !enrollment.certificateId) {
    const user = findUserById(enrollment.userId);
    const quizScores = Object.values(enrollment.quizState ?? {}).map(
      (q) => q.bestScorePercent,
    );

    const certificate: Certificate = {
      id: uid("cert"),
      userId: enrollment.userId,
      courseId: course.id,
      courseSlug: course.slug,
      courseTitle: course.title,
      recipientName: user?.displayName ?? "TES Learner",
      issuedAt: enrollment.completedAt,
      verificationCode: verificationCode(course),
      scorePercent: quizScores.length
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : undefined,
    };

    certificates.push(certificate);
    enrollment.certificateId = certificate.id;
  }

  return enrollment;
};

const toPublicQuiz = (quiz: Quiz, attemptsUsed: number): PublicQuiz => ({
  ...quiz,
  attemptsUsed,
  questions: quiz.questions.map(
    ({ correctOptionIds: _correct, explanation: _explanation, ...rest }) => rest,
  ),
});

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

export const learning_handlers = [

  http.get(`${endPoint}/enrollments`, ({ request }) => {
    const userId = userIdFrom(request);
    return HttpResponse.json(enrollments.filter((e) => e.userId === userId));
  }),

  http.get<{ slug: string }>(
    `${endPoint}/courses/:slug/enrollment`,
    ({ params, request }) => {
      const course = courseBySlug(params.slug);
      if (!course) return notFound("Course not found.");

      const userId = userIdFrom(request);
      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === course.id,
      );
      if (!enrollment) return notFound("Not enrolled.");

      return HttpResponse.json(enrollment);
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/courses/:slug/enroll`,
    async ({ params, request }) => {
      const course = courseBySlug(params.slug);
      if (!course) return notFound("Course not found.");

      const body = (await request.json().catch(() => ({}))) as {
        userId?: string;
      };
      const userId = body.userId || GUEST_ID;

      const existing = enrollments.find(
        (e) => e.userId === userId && e.courseId === course.id,
      );
      if (existing) return HttpResponse.json(existing);

      if (
        course.enrollmentLimit !== undefined &&
        course.enrollmentCount >= course.enrollmentLimit
      ) {
        return HttpResponse.json(
          { message: "This course is full." },
          { status: 409 },
        );
      }

      const enrollment = newEnrollment(userId, course);
      enrollments.push(enrollment);
      course.enrollmentCount += 1;

      return HttpResponse.json(enrollment, { status: 201 });
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/courses/:slug/progress`,
    async ({ params, request }) => {
      const course = courseBySlug(params.slug);
      if (!course) return notFound("Course not found.");

      const body = (await request.json()) as {
        userId?: string;
        lessonId: string;
        completed?: boolean;
      };
      const userId = body.userId || GUEST_ID;

      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === course.id,
      );
      if (!enrollment) return notFound("Not enrolled.");

      const lesson = allLessons(course).find((l) => l.id === body.lessonId);
      if (!lesson) return notFound("Lesson not found.");

      const completed = body.completed ?? true;
      const quizId = quizIdForLesson(course, lesson.id);

      if (completed && quizId && !enrollment.quizState?.[quizId]?.passed) {
        return HttpResponse.json(
          { message: "Pass the quiz before completing this lesson." },
          { status: 409 },
        );
      }

      const done = new Set(enrollment.completedLessonIds);
      if (completed) done.add(lesson.id);
      else done.delete(lesson.id);
      enrollment.completedLessonIds = [...done];
      enrollment.lastLessonId = lesson.id;

      return HttpResponse.json(syncProgress(enrollment, course));
    },
  ),

  http.get<{ quizId: string }>(
    `${endPoint}/quizzes/:quizId`,
    ({ params, request }) => {
      const quiz = quizzes.find((q) => q.id === params.quizId);
      if (!quiz) return notFound("Quiz not found.");

      const userId = userIdFrom(request);
      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === quiz.courseId,
      );

      return HttpResponse.json(
        toPublicQuiz(quiz, enrollment?.quizState?.[quiz.id]?.attempts ?? 0),
      );
    },
  ),

  http.post<{ quizId: string }>(
    `${endPoint}/quizzes/:quizId/attempts`,
    async ({ params, request }) => {
      const quiz = quizzes.find((q) => q.id === params.quizId);
      if (!quiz) return notFound("Quiz not found.");

      const body = (await request.json()) as {
        userId?: string;
        answers: QuizAnswers;
      };
      const userId = body.userId || GUEST_ID;
      const answers = body.answers ?? {};

      const course = courses.find((c) => c.id === quiz.courseId);
      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === quiz.courseId,
      );
      if (!course || !enrollment) return notFound("Not enrolled.");

      const previous = enrollment.quizState?.[quiz.id];
      const attemptNumber = (previous?.attempts ?? 0) + 1;

      if (quiz.maxAttempts && attemptNumber > quiz.maxAttempts) {
        return HttpResponse.json(
          { message: "No attempts remaining." },
          { status: 409 },
        );
      }

      const results: QuizQuestionResult[] = quiz.questions.map((question) => {
        const selected = answers[question.id] ?? [];
        return {
          questionId: question.id,
          selectedOptionIds: selected,
          correctOptionIds: question.correctOptionIds,
          isCorrect: sameSet(selected, question.correctOptionIds),
          explanation: question.explanation,
        };
      });

      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = quiz.questions.reduce(
        (sum, q, i) => sum + (results[i].isCorrect ? q.points : 0),
        0,
      );
      const scorePercent = totalPoints
        ? Math.round((earnedPoints / totalPoints) * 100)
        : 0;
      const passed = scorePercent >= quiz.passScorePercent;

      const attempt: QuizAttempt = {
        id: uid("attempt"),
        quizId: quiz.id,
        userId,
        attemptNumber,
        submittedAt: new Date().toISOString(),
        earnedPoints,
        totalPoints,
        scorePercent,
        passed,
        results,
      };

      enrollment.quizState = {
        ...enrollment.quizState,
        [quiz.id]: {
          bestScorePercent: Math.max(
            previous?.bestScorePercent ?? 0,
            scorePercent,
          ),
          passed: (previous?.passed ?? false) || passed,
          attempts: attemptNumber,
        },
      };

      if (passed && quiz.lessonId) {
        const done = new Set(enrollment.completedLessonIds);
        done.add(quiz.lessonId);
        enrollment.completedLessonIds = [...done];
        enrollment.lastLessonId = quiz.lessonId;
      }
      syncProgress(enrollment, course);

      return HttpResponse.json({ attempt, enrollment }, { status: 201 });
    },
  ),

  http.get<{ slug: string }>(
    `${endPoint}/courses/:slug/certificate`,
    ({ params, request }) => {
      const course = courseBySlug(params.slug);
      if (!course) return notFound("Course not found.");

      const userId = userIdFrom(request);
      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === course.id,
      );
      if (!enrollment) return notFound("Not enrolled.");

      if (!enrollment.certificateId) {
        return HttpResponse.json(
          {
            message: "Course not completed yet.",
            progressPercent: enrollment.progressPercent,
            requiredPercent: course.completionThresholdPercent,
          },
          { status: 409 },
        );
      }

      const certificate = certificates.find(
        (c) => c.id === enrollment.certificateId,
      );
      if (!certificate) return notFound("Certificate not found.");

      return HttpResponse.json(certificate);
    },
  ),

  http.get<{ code: string }>(
    `${endPoint}/certificates/verify/:code`,
    ({ params }) => {
      const certificate = certificates.find(
        (c) => c.verificationCode.toLowerCase() === params.code.toLowerCase(),
      );
      if (!certificate) return notFound("Unknown verification code.");
      return HttpResponse.json(certificate);
    },
  ),

  // Connected to live backend at /api/resources & /api/resources/:id/download
  // http.get(`${endPoint}/resources`, () => HttpResponse.json(resources)),
  // http.post<{ id: string }>(
  //   `${endPoint}/resources/:id/download`,
  //   ({ params }) => {
  //     const resource = resources.find((r) => r.id === params.id);
  //     if (!resource) return notFound("Resource not found.");
  //     resource.downloadCount += 1;
  //     return HttpResponse.json(resource);
  //   },
  // ),
];
