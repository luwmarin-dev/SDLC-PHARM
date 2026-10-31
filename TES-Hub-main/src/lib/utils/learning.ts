import type Course from "@/types/course";
import type CourseSection from "@/types/course-section";
import type Enrollment from "@/types/enrollment";
import type Lesson from "@/types/lesson";

export const orderedSections = (course?: Course | null): CourseSection[] =>
  [...(course?.sections ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      lessons: [...section.lessons].sort((a, b) => a.order - b.order),
    }));

export const orderedLessons = (course?: Course | null): Lesson[] =>
  orderedSections(course).flatMap((section) => section.lessons);

export const findLesson = (course: Course | null | undefined, lessonId: string) =>
  orderedLessons(course).find((lesson) => lesson.id === lessonId);

export const findSectionOfLesson = (
  course: Course | null | undefined,
  lessonId: string,
) =>
  orderedSections(course).find((section) =>
    section.lessons.some((lesson) => lesson.id === lessonId),
  );

export interface LessonNav {
  index: number;
  total: number;
  previous?: Lesson;
  next?: Lesson;
}

export const lessonNav = (
  course: Course | null | undefined,
  lessonId: string,
): LessonNav => {
  const lessons = orderedLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);

  return {
    index,
    total: lessons.length,
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
};

export const isLessonComplete = (
  enrollment: Enrollment | null | undefined,
  lessonId: string,
) => Boolean(enrollment?.completedLessonIds.includes(lessonId));

export const isLessonLocked = (
  lesson: Lesson,
  enrollment: Enrollment | null | undefined,
) => !lesson.isFreePreview && !enrollment;

export const sectionProgress = (
  section: CourseSection,
  enrollment: Enrollment | null | undefined,
) => {
  const total = section.lessons.length;
  const done = section.lessons.filter((lesson) =>
    isLessonComplete(enrollment, lesson.id),
  ).length;

  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
};

export const courseMinutes = (course?: Course | null) =>
  orderedLessons(course).reduce(
    (total, lesson) => total + (lesson.durationMinutes || 0),
    0,
  );

export const remainingMinutes = (
  course: Course | null | undefined,
  enrollment: Enrollment | null | undefined,
) =>
  orderedLessons(course)
    .filter((lesson) => !isLessonComplete(enrollment, lesson.id))
    .reduce((total, lesson) => total + (lesson.durationMinutes || 0), 0);

export const resumeLessonId = (
  course: Course | null | undefined,
  enrollment: Enrollment | null | undefined,
) => {
  const lessons = orderedLessons(course);
  if (!lessons.length) return undefined;

  const firstUnfinished = lessons.find(
    (lesson) => !isLessonComplete(enrollment, lesson.id),
  );

  return firstUnfinished?.id ?? enrollment?.lastLessonId ?? lessons[0].id;
};

export const quizIdOfLesson = (lesson?: Lesson | null) =>
  lesson?.content?.kind === "quiz" ? lesson.content.quizId : undefined;
