import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import moment from "moment";
import "moment/dist/locale/ru";
import "moment/dist/locale/ky";

import en from "./en/translation.json";
import ky from "./ky/translation.json";
import ru from "./ru/translation.json";

export const SUPPORTED_LANGUAGES = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "ky", label: "Кыргызча", short: "KY" },
  { code: "en", label: "English", short: "EN" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "ru";

export const STORAGE_KEY = "tes-lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      ky: { translation: ky },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  moment.locale(lng);
});

moment.locale(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);

export default i18n;
