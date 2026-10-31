import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  const current =
    SUPPORTED_LANGUAGES.find((lang) =>
      i18n.resolvedLanguage?.startsWith(lang.code),
    ) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={wrapper} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-lg border border-[#C1C8C2] px-2.5 py-1.5 text-sm font-semibold text-[#414844] cursor-pointer hover:border-[#012D1D]"
      >
        <Globe size={16} />
        {current.short}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-[1000] mt-2 w-40 overflow-hidden rounded-lg border border-[#C1C8C2] bg-white shadow-lg"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm cursor-pointer hover:bg-[#F2F4F2] ${
                  lang.code === current.code
                    ? "font-semibold text-[#012D1D]"
                    : "text-[#414844]"
                }`}
              >
                {lang.label}
                <span className="text-xs text-[#5C6660]">{lang.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
