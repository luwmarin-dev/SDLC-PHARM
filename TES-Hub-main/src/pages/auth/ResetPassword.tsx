import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../components/ui/button";
import axiosInstance from "../../lib/api/apiClient";
import AuthShell from "./components/AuthShell";
import { messageOf } from "@/lib/utils/errors";

interface LocationState {
  email: string;
  code: string;
}

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, t("auth.errors.passwordMin")),
      confirmPassword: z.string().min(1, t("auth.errors.confirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

type SchemaProps = z.infer<ReturnType<typeof buildSchema>>;

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SchemaProps> = async (data) => {
    setServerError("");
    try {
      await axiosInstance.post("/auth/reset-password", {
        email: state?.email,
        code: state?.code,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setServerError(messageOf(err, t("auth.reset.failed")));
    }
  };

  return (
    <AuthShell>
      <h2 className="text-[#012D1D] font-bold text-4xl">
        {t("auth.reset.title")}
      </h2>
      <p className="text-[#414844] text-base mt-3">
        {t("auth.reset.subtitle")}
      </p>

      {success ? (
        <div className="mt-8 p-4 bg-[#E8F5E2] border border-[#1F6D1A] rounded-sm">
          <p className="text-[#1F6D1A] font-semibold">
            {t("auth.reset.success")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="flex flex-col">
            <label htmlFor="password" className="text-[#414844]">
              {t("auth.reset.newPassword")}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
                errors.password ? "border-red-500" : "border-[#6B7280]"
              }`}
            />
            {errors.password && (
              <span className="mt-2 text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col mt-5">
            <label htmlFor="confirmPassword" className="text-[#414844]">
              {t("auth.reset.confirmNewPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
                errors.confirmPassword ? "border-red-500" : "border-[#6B7280]"
              }`}
            />
            {errors.confirmPassword && (
              <span className="mt-2 text-red-500 text-sm">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {serverError && (
            <p className="mt-3 text-red-500 text-sm">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            variant="filled"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("auth.reset.resetting") : t("auth.reset.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
