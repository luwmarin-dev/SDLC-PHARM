import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../components/ui/button";
import axiosInstance from "../../lib/api/apiClient";
import { useAuthStore } from "../../store/authStore";
import type User from "../../types/user";
import CATEGORIES, { CATEGORY_KEYS } from "../../types/category";
import AuthShell from "./components/AuthShell";
import { messageOf } from "@/lib/utils/errors";

const OBLASTS = [
  "Bishkek",
  "Chui",
  "Osh",
  "Osh City",
  "Jalal-Abad",
  "Naryn",
  "Batken",
  "Talas",
  "Issyk-Kul",
];

const LANGUAGES = ["ky", "ru", "en"] as const;

const INTERESTS = CATEGORIES;

const buildStep1Schema = (t: (key: string) => string) =>
  z.object({
    displayName: z.string().min(2, t("auth.errors.displayNameMin")),
    username: z
      .string()
      .min(3, t("auth.errors.usernameMin"))
      .regex(/^[a-zA-Z0-9_]+$/, t("auth.errors.usernamePattern")),
    bio: z.string().max(200, t("auth.errors.bioMax")).optional(),
  });

const buildStep2Schema = (t: (key: string) => string) =>
  z.object({
    oblast: z.string().min(1, t("auth.errors.regionRequired")),
    languages: z
      .array(z.enum(["ru", "ky", "en"]))
      .min(1, t("auth.errors.languageRequired")),
    interests: z.array(z.string()).optional(),
  });

type Step1Props = z.infer<ReturnType<typeof buildStep1Schema>>;
type Step2Props = z.infer<ReturnType<typeof buildStep2Schema>>;

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Props | null>(null);
  const [serverError, setServerError] = useState("");
  const step1Schema = useMemo(() => buildStep1Schema(t), [t]);
  const step2Schema = useMemo(() => buildStep2Schema(t), [t]);

  const form1 = useForm<Step1Props>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      displayName: user?.displayName ?? "",
      username: user?.username ?? "",
      bio: user?.bio ?? "",
    },
  });

  const form2 = useForm<Step2Props>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      oblast: user?.region?.oblast ?? "",
      languages: (user?.languages as ("ru" | "ky" | "en")[]) ?? [],
      interests: user?.interests ?? [],
    },
  });

  const handleStep1: SubmitHandler<Step1Props> = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2: SubmitHandler<Step2Props> = async (data) => {
    if (!step1Data) return;
    setServerError("");
    try {
      const res = await axiosInstance.patch<User>("/profile/me", {
        displayName: step1Data.displayName,
        username: step1Data.username,
        bio: step1Data.bio,
        region: { oblast: data.oblast },
        languages: data.languages,
        interests: data.interests ?? [],
      });
      if (token) setAuth(token, res.data);
      navigate("/");
    } catch (err) {
      setServerError(messageOf(err, t("auth.onboarding.saveFailed")));
    }
  };

  return (
    <AuthShell>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#012D1D]" : "bg-[#C1C8C2]"}`}
        />
        <div
          className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#012D1D]" : "bg-[#C1C8C2]"}`}
        />
      </div>
      <p className="text-[#717973] text-xs mb-6">
        {t("auth.onboarding.step", { step })}
      </p>

      <h2 className="text-[#012D1D] font-bold text-4xl">
        {step === 1
          ? t("auth.onboarding.profileTitle")
          : t("auth.onboarding.preferencesTitle")}
      </h2>
      <p className="text-[#414844] text-base mt-2">
        {step === 1
          ? t("auth.onboarding.profileSubtitle")
          : t("auth.onboarding.preferencesSubtitle")}
      </p>

      {step === 1 && (
        <form onSubmit={form1.handleSubmit(handleStep1)} className="mt-6">
          <div className="flex flex-col">
            <label htmlFor="displayName" className="text-[#414844]">
              {t("auth.onboarding.displayName")}
            </label>
            <input
              id="displayName"
              type="text"
              placeholder={t("auth.onboarding.displayNamePlaceholder")}
              {...form1.register("displayName")}
              className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
                form1.formState.errors.displayName
                  ? "border-red-500"
                  : "border-[#6B7280]"
              }`}
            />
            {form1.formState.errors.displayName && (
              <span className="mt-2 text-red-500 text-sm">
                {form1.formState.errors.displayName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col mt-5">
            <label htmlFor="username" className="text-[#414844]">
              {t("auth.username")}
            </label>
            <input
              id="username"
              type="text"
              placeholder={t("auth.onboarding.usernamePlaceholder")}
              {...form1.register("username")}
              className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
                form1.formState.errors.username
                  ? "border-red-500"
                  : "border-[#6B7280]"
              }`}
            />
            {form1.formState.errors.username && (
              <span className="mt-2 text-red-500 text-sm">
                {form1.formState.errors.username.message}
              </span>
            )}
          </div>

          <div className="flex flex-col mt-5">
            <div className="flex justify-between">
              <label htmlFor="bio" className="text-[#414844]">
                {t("auth.onboarding.bio")}{" "}
                <span className="text-[#717973] text-sm">
                  {t("auth.onboarding.optional")}
                </span>
              </label>
              <span className="text-[#717973] text-xs">
                {form1.watch("bio")?.length ?? 0}/200
              </span>
            </div>
            <textarea
              id="bio"
              rows={3}
              placeholder={t("auth.onboarding.bioPlaceholder")}
              {...form1.register("bio")}
              className="placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white border-[#6B7280] resize-none"
            />
            {form1.formState.errors.bio && (
              <span className="mt-2 text-red-500 text-sm">
                {form1.formState.errors.bio.message}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full mt-6" variant="filled">
            {t("auth.onboarding.continue")}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={form2.handleSubmit(handleStep2)} className="mt-6">
          <div className="flex flex-col">
            <label htmlFor="oblast" className="text-[#414844]">
              {t("auth.onboarding.region")}
            </label>
            <select
              id="oblast"
              {...form2.register("oblast")}
              className={`p-3 py-2 outline-none border mt-1 bg-white text-[#414844] ${
                form2.formState.errors.oblast
                  ? "border-red-500"
                  : "border-[#6B7280]"
              }`}
            >
              <option value="">{t("auth.onboarding.selectRegion")}</option>
              {OBLASTS.map((o) => (
                <option key={o} value={o}>
                  {t(`auth.oblast.${o}`)}
                </option>
              ))}
            </select>
            {form2.formState.errors.oblast && (
              <span className="mt-2 text-red-500 text-sm">
                {form2.formState.errors.oblast.message}
              </span>
            )}
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-[#414844] mb-2">
              {t("auth.onboarding.languages")}
            </label>
            <div className="flex gap-3">
              {LANGUAGES.map((value) => {
                const checked = form2.watch("languages")?.includes(value);
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-4 py-2 border cursor-pointer select-none transition-colors ${
                      checked
                        ? "border-[#012D1D] bg-[#E8F5E2] text-[#012D1D]"
                        : "border-[#C1C8C2] text-[#414844]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      className="hidden"
                      {...form2.register("languages")}
                    />
                    {t(`auth.language.${value}`)}
                  </label>
                );
              })}
            </div>
            {form2.formState.errors.languages && (
              <span className="mt-2 text-red-500 text-sm">
                {form2.formState.errors.languages.message}
              </span>
            )}
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-[#414844] mb-2">
              {t("auth.onboarding.interests")}{" "}
              <span className="text-[#717973] text-sm">
                {t("auth.onboarding.optional")}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = form2.watch("interests")?.includes(interest);
                return (
                  <label
                    key={interest}
                    className={`px-3 py-1.5 border text-sm cursor-pointer select-none transition-colors rounded-sm ${
                      selected
                        ? "border-[#012D1D] bg-[#012D1D] text-white"
                        : "border-[#C1C8C2] text-[#414844]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={interest}
                      className="hidden"
                      {...form2.register("interests")}
                    />
                    {t(CATEGORY_KEYS[interest])}
                  </label>
                );
              })}
            </div>
          </div>

          {serverError && (
            <p className="mt-3 text-red-500 text-sm">{serverError}</p>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              {t("common.back")}
            </Button>
            <Button
              type="submit"
              variant="filled"
              className="flex-1"
              disabled={form2.formState.isSubmitting}
            >
              {form2.formState.isSubmitting
                ? t("common.saving")
                : t("auth.onboarding.finish")}
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
};

export default Onboarding;
