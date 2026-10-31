import { CheckCircle2, TriangleAlert } from "lucide-react";

interface Props {
  tone: "success" | "error";
  children: string;
}

const StatusMessage = ({ tone, children }: Props) => {
  const isError = tone === "error";
  const Icon = isError ? TriangleAlert : CheckCircle2;

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`flex items-center gap-2 text-sm ${
        isError ? "text-[#BA1A1A]" : "text-[#1F6D1A]"
      }`}
    >
      <Icon size={16} />
      {children}
    </p>
  );
};

export default StatusMessage;
