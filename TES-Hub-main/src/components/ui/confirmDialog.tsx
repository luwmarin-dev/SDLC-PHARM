import { TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-[#BA1A1A] hover:bg-[#93000A]"
      : "bg-[#012D1D] hover:opacity-90";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-999 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            {tone === "danger" && (
              <div className="p-2 rounded-lg bg-[#FFDAD6] text-[#93000A] h-max">
                <TriangleAlert size={20} />
              </div>
            )}
            <div>
              <h2 className="text-[#012D1D] text-lg font-semibold">{title}</h2>
              <p className="text-[#414844] text-sm mt-1">{message}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onCancel}
            className="text-[#6B7280] hover:text-[#191C1B] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-md border border-[#C1C8C2] text-[#191C1B] text-sm font-semibold cursor-pointer hover:bg-[#F9FAFB]"
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-md text-white text-sm font-semibold cursor-pointer ${confirmClass}`}
          >
            {confirmLabel ?? t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
