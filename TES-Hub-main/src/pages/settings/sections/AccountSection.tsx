import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { z } from "zod";

import Button from "../../../components/ui/button";
import axiosInstance from "../../../lib/api/apiClient";
import { useAuthStore } from "../../../store/authStore";
import CATEGORIES, { CATEGORY_KEYS } from "../../../types/category";
import type { Category } from "../../../types/category";
import type User from "../../../types/user";
import SettingsCard from "../components/SettingsCard";
import StatusMessage from "../components/StatusMessage";
import { OBLASTS } from "../constants";

const buildSchema = (t: (key: string) => string) =>
  z.object({
    displayName: z.string().min(2, t("auth.errors.displayNameMin")),
    username: z
      .string()
      .min(3, t("auth.errors.usernameMin"))
      .regex(/^[a-zA-Z0-9_]+$/, t("auth.errors.usernamePattern")),
    bio: z.string().max(200, t("auth.errors.bioMax")).optional(),
    oblast: z.string().min(1, t("auth.errors.regionRequired")),
    raion: z.string().optional(),
    village: z.string().optional(),
  });

type FormProps = z.infer<ReturnType<typeof buildSchema>>;

const fieldStyles = (hasError: boolean) =>
  `placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white rounded-sm w-full ${
    hasError ? "border-red-500" : "border-[#6B7280]"
  }`;

interface Props {
  user: User;
}

const AccountSection = ({ user }: Props) => {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user.displayName,
      username: user.username,
      bio: user.bio ?? "",
      oblast: user.region?.oblast ?? "",
      raion: user.region?.raion ?? "",
      village: user.region?.village ?? "",
    },
  });

  const toggleInterest = (interest: string) =>
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest],
    );

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    setSaved(false);
    setServerError("");

    try {
      const res = await axiosInstance.patch<User>("/profile/me", {
        id: user.id,
        displayName: data.displayName,
        username: data.username,
        bio: data.bio,
        region: {
          oblast: data.oblast,
          raion: data.raion || undefined,
          village: data.village || undefined,
        },
        interests,
      });

      if (token) setAuth(token, res.data);
      setSaved(true);
    } catch (err: unknown) {
      setServerError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("settings.saveFailed"),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SettingsCard
        title={t("settings.account.title")}
        description={t("settings.account.subtitle")}
        footer={
          <>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
            {saved && (
              <StatusMessage tone="success">
                {t("settings.saved")}
              </StatusMessage>
            )}
            {serverError && (
              <StatusMessage tone="error">{serverError}</StatusMessage>
            )}
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="displayName" className="text-[#414844]">
              {t("settings.account.displayName")}
            </label>
            <input
              id="displayName"
              type="text"
              {...register("displayName")}
              className={fieldStyles(!!errors.displayName)}
            />
            {errors.displayName && (
              <span className="mt-1 text-red-500 text-sm">
                {errors.displayName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="username" className="text-[#414844]">
              {t("settings.account.username")}
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className={fieldStyles(!!errors.username)}
            />
            {errors.username && (
              <span className="mt-1 text-red-500 text-sm">
                {errors.username.message}
              </span>
            )}
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="email" className="text-[#414844]">
              {t("settings.account.email")}
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              className="p-3 py-2 outline-none border mt-1 rounded-sm w-full border-[#C1C8C2] bg-[#F4F6F5] text-[#6B7280]"
            />
            <span className="text-[#6B7280] text-sm mt-1">
              {t("settings.account.emailHint")}
            </span>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="bio" className="text-[#414844]">
              {t("settings.account.bio")}
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              placeholder={t("auth.onboarding.bioPlaceholder")}
              className={`${fieldStyles(!!errors.bio)} resize-y`}
            />
            {errors.bio && (
              <span className="mt-1 text-red-500 text-sm">
                {errors.bio.message}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="oblast" className="text-[#414844]">
              {t("settings.account.region")}
            </label>
            <select
              id="oblast"
              {...register("oblast")}
              className={fieldStyles(!!errors.oblast)}
            >
              <option value="">{t("auth.onboarding.selectRegion")}</option>
              {OBLASTS.map((oblast) => (
                <option key={oblast} value={oblast}>
                  {oblast}
                </option>
              ))}
            </select>
            {errors.oblast && (
              <span className="mt-1 text-red-500 text-sm">
                {errors.oblast.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label htmlFor="raion" className="text-[#414844]">
                {t("settings.account.raion")}
              </label>
              <input
                id="raion"
                type="text"
                {...register("raion")}
                className={fieldStyles(false)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="village" className="text-[#414844]">
                {t("settings.account.village")}
              </label>
              <input
                id="village"
                type="text"
                {...register("village")}
                className={fieldStyles(false)}
              />
            </div>
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="text-[#414844]">
            {t("settings.account.interests")}
          </legend>
          <div className="flex flex-wrap gap-3 mt-3">
            {CATEGORIES.map((category) => {
              const selected = interests.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleInterest(category)}
                  className={`px-4 py-2 rounded-full text-sm border cursor-pointer transition ${
                    selected
                      ? "bg-[#012D1D] text-white border-[#012D1D]"
                      : "bg-white text-[#414844] border-[#C1C8C2] hover:border-[#012D1D]"
                  }`}
                >
                  {t(CATEGORY_KEYS[category as Category])}
                </button>
              );
            })}
          </div>
        </fieldset>
      </SettingsCard>
    </form>
  );
};

export default AccountSection;
