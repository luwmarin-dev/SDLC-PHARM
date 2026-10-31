import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import Button from "../../../components/ui/button";
import ConfirmDialog from "../../../components/ui/confirmDialog";
import axiosInstance from "../../../lib/api/apiClient";
import { useAuthStore } from "../../../store/authStore";
import SettingsCard from "../components/SettingsCard";
import StatusMessage from "../components/StatusMessage";

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(8, t("settings.security.errors.current")),
      newPassword: z.string().min(8, t("settings.security.errors.newPassword")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("settings.security.errors.mismatch"),
      path: ["confirmPassword"],
    });

type FormProps = z.infer<ReturnType<typeof buildSchema>>;

const fieldStyles = (hasError: boolean) =>
  `p-3 py-2 outline-none border mt-1 bg-white rounded-sm w-full ${
    hasError ? "border-red-500" : "border-[#6B7280]"
  }`;

const SecuritySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [changed, setChanged] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormProps>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    setChanged(false);
    setServerError("");

    try {
      await axiosInstance.post("/settings/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      setChanged(true);
    } catch (err: unknown) {
      setServerError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("settings.security.changeFailed"),
      );
    }
  };

  const logOut = () => {
    clearAuth();
    navigate("/");
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete("/profile/me");
      clearAuth();
      navigate("/");
    } catch (err: unknown) {
      setConfirmDelete(false);
      setServerError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("settings.security.deleteFailed"),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <SettingsCard
          title={t("settings.security.title")}
          description={t("settings.security.subtitle")}
          footer={
            <>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("common.saving")
                  : t("settings.security.changePassword")}
              </Button>
              {changed && (
                <StatusMessage tone="success">
                  {t("settings.security.passwordChanged")}
                </StatusMessage>
              )}
              {serverError && (
                <StatusMessage tone="error">{serverError}</StatusMessage>
              )}
            </>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="currentPassword" className="text-[#414844]">
                {t("settings.security.currentPassword")}
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
                className={fieldStyles(!!errors.currentPassword)}
              />
              {errors.currentPassword && (
                <span className="mt-1 text-red-500 text-sm">
                  {errors.currentPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="newPassword" className="text-[#414844]">
                {t("settings.security.newPassword")}
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                className={fieldStyles(!!errors.newPassword)}
              />
              {errors.newPassword && (
                <span className="mt-1 text-red-500 text-sm">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="text-[#414844]">
                {t("settings.security.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={fieldStyles(!!errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <span className="mt-1 text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
        </SettingsCard>
      </form>

      <SettingsCard
        title={t("settings.security.sessionTitle")}
        description={t("settings.security.sessionSubtitle")}
      >
        <Button
          type="button"
          variant="outline"
          className="gap-3"
          Icon={LogOut}
          onClick={logOut}
        >
          {t("common.logOut")}
        </Button>
      </SettingsCard>

      <section className="border border-[#FFB4AB] rounded-xl bg-[#FFF8F7] p-6 md:p-8">
        <h2 className="text-[#93000A] text-xl md:text-2xl font-semibold">
          {t("settings.security.dangerZone")}
        </h2>
        <p className="text-[#414844] text-sm mt-2 max-w-2xl">
          {t("settings.security.deleteAccountText")}
        </p>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="mt-6 px-5 py-3 rounded-xl bg-[#BA1A1A] hover:bg-[#93000A] text-white font-semibold text-sm cursor-pointer transition active:scale-95"
        >
          {t("settings.security.deleteAccount")}
        </button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title={t("settings.security.deleteConfirmTitle")}
        message={t("settings.security.deleteConfirmText")}
        confirmLabel={
          deleting ? t("common.saving") : t("settings.security.deleteAccount")
        }
        onConfirm={deleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default SecuritySection;
