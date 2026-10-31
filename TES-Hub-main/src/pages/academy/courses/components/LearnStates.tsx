import { AlertTriangle, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";

export const LearnLoading = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-16">
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-2/3 rounded bg-[#c1c8c280]" />
      <div className="h-2 w-full rounded bg-[#c1c8c280]" />
      <div className="flex gap-8">
        <div className="hidden lg:block h-96 w-[340px] rounded-xl bg-[#c1c8c280]" />
        <div className="h-96 flex-1 rounded-xl bg-[#c1c8c280]" />
      </div>
    </div>
  </div>
);

interface MessageProps {
  title: string;
  body?: string;
  action?: { label: string; to: string };
}

export const LearnMessage = ({ title, body, action }: MessageProps) => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-20">
    <div className="mx-auto max-w-lg rounded-xl border border-[#C1C8C2] bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFDCC3]">
        <AlertTriangle className="text-[#8A4A00]" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-[#191C1B]">{title}</h1>
      {body && <p className="mt-3 text-[#414844]">{body}</p>}
      {action && (
        <Link to={action.to} className="mt-6 inline-block">
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  </div>
);

interface GateProps {
  courseSlug: string;
  onEnroll: () => void;
  isEnrolling: boolean;
}

export const EnrollGate = ({
  courseSlug,
  onEnroll,
  isEnrolling,
}: GateProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-[#C1C8C2] bg-white p-8 sm:p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFDCC3]">
        <Lock className="text-[#3E1E00]" />
      </div>
      <h2 className="mt-6 text-2xl sm:text-3xl font-semibold text-[#191C1B]">
        {t("lesson.lockedTitle")}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[#414844]">
        {t("lesson.lockedBody")}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onEnroll} disabled={isEnrolling}>
          {isEnrolling ? t("course.enrolling") : t("learn.enrollToStart")}
        </Button>
        <Link to={`/academy/courses/${courseSlug}`}>
          <Button variant="outline">{t("course.backToCourse")}</Button>
        </Link>
      </div>
    </div>
  );
};
