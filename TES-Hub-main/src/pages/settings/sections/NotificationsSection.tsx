import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import Button from "../../../components/ui/button";
import Toggle from "../../../components/ui/toggle";
import type UserSettings from "../../../types/settings";
import type { NotificationSettings } from "../../../types/settings";
import SettingsCard from "../components/SettingsCard";
import StatusMessage from "../components/StatusMessage";

const OPTIONS: { key: keyof NotificationSettings; labelKey: string }[] = [
  { key: "emailReplies", labelKey: "replies" },
  { key: "emailSessions", labelKey: "sessions" },
  { key: "emailCourses", labelKey: "courses" },
  { key: "emailNewsletter", labelKey: "newsletter" },
];

interface Props {
  settings: UserSettings;
  save: (patch: Partial<UserSettings>) => Promise<UserSettings>;
}

const NotificationsSection = ({ settings, save }: Props) => {
  const { t } = useTranslation();

  const [values, setValues] = useState<NotificationSettings>(
    settings.notifications,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof NotificationSettings, checked: boolean) => {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: checked }));
  };

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await save({ notifications: values });
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
      title={t("settings.notifications.title")}
      description={t("settings.notifications.subtitle")}
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
            label={t(`settings.notifications.${option.labelKey}`)}
            description={t(`settings.notifications.${option.labelKey}Text`)}
          />
        ))}
      </div>
    </SettingsCard>
  );
};

export default NotificationsSection;
