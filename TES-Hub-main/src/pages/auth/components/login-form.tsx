import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import z from "zod";
import Button from "../../../components/ui/button";
import axiosInstance from "../../../lib/api/apiClient";
import { messageOf } from "../../../lib/utils/errors";
import { safeNext } from "../../../lib/utils/redirect";
import { useAuthStore } from "../../../store/authStore";
import type User from "../../../types/user";

const buildSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t("auth.errors.emailInvalid")),
    password: z.string().min(8, t("auth.errors.passwordMin")),
  });

type SchemaProps = z.infer<ReturnType<typeof buildSchema>>;

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState("");
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
      const res = await axiosInstance.post<{ token: string; user: User }>(
        "/auth/login",
        data,
      );
      setAuth(res.data.token, res.data.user);
      // Return the user to whatever they were trying to reach before signing in.
      navigate(safeNext(search), { replace: true });
    } catch (err) {
      setServerError(messageOf(err, t("auth.loginFailed")));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col mt-5">
        <label htmlFor="email" className="text-[#414844]">
          {t("auth.email")}
        </label>
        <input
          id="email"
          type="text"
          placeholder={t("auth.emailPlaceholder")}
          {...register("email")}
          className={`placeholder:text-[#6B7280] p-3 py-2 rounded-none outline-none border mt-1 bg-white ${
            errors.email ? "border-red-500" : "border-[#6B7280]"
          }`}
        />
        {errors.email && (
          <span className="mt-2 text-red-500 text-sm">
            {errors.email.message || t("auth.errors.emailAt")}
          </span>
        )}
      </div>

      <div className="flex flex-col mt-5">
        <div className="flex justify-between">
          <label htmlFor="password" className="text-[#414844]">
            {t("auth.password")}
          </label>
          <span
            className="text-[#1F6D1A] text-sm cursor-pointer"
            onClick={() => navigate("/auth/forgot-password")}
          >
            {t("auth.forgotPassword")}
          </span>
        </div>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className={`placeholder:text-[#6B7280] p-3 py-2 rounded-none outline-none border mt-1 bg-white ${
            errors.password ? "border-red-500" : "border-[#6B7280]"
          }`}
        />
        {errors.password && (
          <span className="mt-2 text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      {serverError && (
        <p className="mt-3 text-red-500 text-sm">{serverError}</p>
      )}

      <Button
        type="submit"
        className="w-full mt-5"
        variant="filled"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("auth.loggingIn") : t("auth.logIn")}
      </Button>
    </form>
  );
};

export default LoginForm;
