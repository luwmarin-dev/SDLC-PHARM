import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToastStore, type Toast as ToastData } from "../../store/toastStore";

const TONE_STYLES = {
  success: {
    Icon: CheckCircle2,
    border: "border-l-[#1F6D1A]",
    icon: "text-[#1F6D1A]",
  },
  error: {
    Icon: TriangleAlert,
    border: "border-l-[#BA1A1A]",
    icon: "text-[#BA1A1A]",
  },
  info: {
    Icon: Info,
    border: "border-l-[#012D1D]",
    icon: "text-[#012D1D]",
  },
} as const;

const ToastItem = ({ toast }: { toast: ToastData }) => {
  const { t } = useTranslation();
  const dismiss = useToastStore((state) => state.dismiss);
  const { Icon, border, icon } = TONE_STYLES[toast.tone];

  useEffect(() => {
    if (!toast.duration) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-[#C1C8C2] border-l-4 ${border} bg-white p-4 shadow-lg animate-in slide-in-from-right-4 fade-in duration-200`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${icon}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold break-words text-[#191C1B]">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-1 text-sm break-words text-[#414844]">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={() => dismiss(toast.id)}
        className="shrink-0 cursor-pointer text-[#6B7280] hover:text-[#191C1B]"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-24 right-4 z-[1001] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toaster;
