import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import Button from "../../../components/ui/button";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../../../i18n";
import { useAuthStore } from "../../../store/authStore";
import axiosInstance from "../../../lib/api/apiClient";
import type User from "../../../types/user";
import type UserSettings from "../../../types/settings";
import SettingsCard from "../components/SettingsCard";
import StatusMessage from "../components/StatusMessage";

interface Props {
  user: User;
  settings: UserSettings;
  save: (patch: Partial<UserSettings>) => Promise<UserSettings>;
}

const PreferencesSection = ({ user, settings, save }: Props) => {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [contentLanguages, setContentLanguages] = useState<LanguageCode[]>(
    settings.contentLanguages,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggleLanguage = (code: LanguageCode) => {
    setSaved(false);
    setContentLanguages((current) =>
      current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code],
    );
  };

  const changeInterfaceLanguage = (code: LanguageCode) => {
    setSaved(false);
    i18n.changeLanguage(code);
  };

  const onSave = async () => {
    if (contentLanguages.length === 0) {
      setError(t("settings.preferences.atLeastOne"));
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await save({ contentLanguages });
      // The content languages also live on the profile, so both stay in sync.
      const res = await axiosInstance.patch<User>("/profile/me", {
        id: user.id,
        languages: contentLanguages,
      });
      if (token) setAuth(token, res.data);
      setSaved(true);
    } catch (err: unknown) {
      setError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("settings.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const currentLanguage = (i18n.resolvedLanguage ??
    i18n.language) as LanguageCode;

  return (
    <SettingsCard
      title={t("settings.preferences.title")}
      description={t("settings.preferences.subtitle")}
      footer={
        <>
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
          {saved && (
            <StatusMessage tone="success">{t("settings.saved")}</StatusMessage>
          )}
          {error && <StatusMessage tone="error">{error}</StatusMessage>}
        </>
      }
    >
      <fieldset>
        <p className="text-[#191C1B] font-medium">
          {t("settings.preferences.interfaceLanguage")}
        </p>
        <p className="text-[#6B7280] text-sm mt-1">
          {t("settings.preferences.interfaceLanguageHint")}
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = currentLanguage === language.code;
            return (
              <button
                key={language.code}
                type="button"
                aria-pressed={selected}
                onClick={() => changeInterfaceLanguage(language.code)}
                className={`px-5 py-2 rounded-lg text-sm border cursor-pointer transition ${
                  selected
                    ? "bg-[#012D1D] text-white border-[#012D1D]"
                    : "bg-white text-[#414844] border-[#C1C8C2] hover:border-[#012D1D]"
                }`}
              >
                {language.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-8 pt-8 border-t border-[#E2E8F0]">
        <p className="text-[#191C1B] font-medium">
          {t("settings.preferences.contentLanguages")}
        </p>
        <p className="text-[#6B7280] text-sm mt-1">
          {t("settings.preferences.contentLanguagesHint")}
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = contentLanguages.includes(language.code);
            return (
              <label
                key={language.code}
                className={`px-5 py-2 rounded-lg text-sm border cursor-pointer transition select-none ${
                  selected
                    ? "bg-[#012D1D] text-white border-[#012D1D]"
                    : "bg-white text-[#414844] border-[#C1C8C2] hover:border-[#012D1D]"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => toggleLanguage(language.code)}
                />
                {language.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </SettingsCard>
  );
};

export default PreferencesSection;
