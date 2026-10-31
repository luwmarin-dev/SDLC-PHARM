import type BaseContent from "./base-content";

export default interface Question extends BaseContent {
  type: "question";
  body: string;
  surface: "community";
  isSolved: boolean;
  acceptedAnswerId?: string;
  answerCount: number;
}
