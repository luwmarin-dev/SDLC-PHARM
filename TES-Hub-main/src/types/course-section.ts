import type Lesson from "./lesson";

export default interface CourseSection {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}
