import {
  ExternalLink,
  FileDown,
  FileQuestion,
  FileText,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import type Lesson from "@/types/lesson";

export const LESSON_ICONS: Record<Lesson["type"], LucideIcon> = {
  video: PlayCircle,
  article: FileText,
  pdf: FileDown,
  quiz: FileQuestion,
  external_link: ExternalLink,
};

export const LESSON_TINTS: Record<Lesson["type"], string> = {
  video: "bg-[#E4F0FF] text-[#1B4E86]",
  article: "bg-[#E7F3E7] text-[#1F6D1A]",
  pdf: "bg-[#FFEFE1] text-[#8A4A00]",
  quiz: "bg-[#F1E7FF] text-[#5B2E9E]",
  external_link: "bg-[#E9ECEA] text-[#414844]",
};

export const formatMinutes = (minutes: number) => {
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const formatFileSize = (sizeKb?: number) => {
  if (!sizeKb) return "";
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
};
