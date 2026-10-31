import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import Button from "../../../components/ui/button";
import Toggle from "../../../components/ui/toggle";
import type UserSettings from "../../../types/settings";
import type { PrivacySettings } from "../../../types/settings";
import SettingsCard from "../components/SettingsCard";
import StatusMessage from "../components/StatusMessage";

const OPTIONS: { key: keyof PrivacySettings; labelKey: string }[] = [
  { key: "publicProfile", labelKey: "publicProfile" },
  { key: "showRegion", labelKey: "showRegion" },
  { key: "allowMessages", labelKey: "allowMessages" },
];

interface Props {
  settings: UserSettings;
  save: (patch: Partial<UserSettings>) => Promise<UserSettings>;
}

const PrivacySection = ({ settings, save }: Props) => {
  const { t } = useTranslation();

  const [values, setValues] = useState<PrivacySettings>(settings.privacy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof PrivacySettings, checked: boolean) => {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: checked }));
  };

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await save({ privacy: values });
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

  return (
    <SettingsCard
      title={t("settings.privacy.title")}
      description={t("settings.privacy.subtitle")}
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
      <div className="divide-y divide-[#E2E8F0]">
        {OPTIONS.map((option) => (
          <Toggle
            key={option.key}
            checked={values[option.key]}
            onChange={(checked) => update(option.key, checked)}
            label={t(`settings.privacy.${option.labelKey}`)}
            description={t(`settings.privacy.${option.labelKey}Text`)}
          />
        ))}
      </div>
    </SettingsCard>
  );
};

export default PrivacySection;
