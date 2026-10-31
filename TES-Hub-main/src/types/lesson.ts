export interface LessonResource {
  id: string;
  label: string;
  url: string;
  sizeKb?: number;
}

export interface ArticleLessonContent {
  kind: "article";
  body: string;
}

export interface VideoLessonContent {
  kind: "video";
  url: string;
  poster?: string;
  transcript?: string;
}

export interface PdfLessonContent {
  kind: "pdf";
  url: string;
  fileName: string;
  sizeKb: number;
  summary?: string;
}

export interface ExternalLinkLessonContent {
  kind: "external_link";
  url: string;
  summary?: string;
}

export interface QuizLessonContent {
  kind: "quiz";
  quizId: string;
}

export type LessonContent =
  | ArticleLessonContent
  | VideoLessonContent
  | PdfLessonContent
  | ExternalLinkLessonContent
  | QuizLessonContent;

export default interface Lesson {
  id: string;
  title: string;
  order: number;
  type: "article" | "video" | "pdf" | "quiz" | "external_link";
  durationMinutes: number;
  isFreePreview: boolean;
  summary?: string;
  content?: LessonContent;
  resources?: LessonResource[];
}
