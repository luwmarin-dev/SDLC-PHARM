import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../../components/ui/button";
import axiosInstance from "../../../lib/api/apiClient";
import { messageOf } from "@/lib/utils/errors";

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      fullname: z.string().nonempty(t("auth.errors.fullNameRequired")),
      username: z.string().nonempty(t("auth.errors.usernameRequired")),
      email: z.string().email(t("auth.errors.emailInvalid")),
      password: z.string().min(8, t("auth.errors.passwordMin")),
      confirmPassword: z.string().min(1, t("auth.errors.confirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

type SchemaProps = z.infer<ReturnType<typeof buildSchema>>;

const SignupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      await axiosInstance.post("/auth/signup", {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate("/auth/verify-email", {
        state: { flow: "signup", email: data.email },
      });
    } catch (err) {
      setServerError(messageOf(err, t("auth.signupFailed")));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col mt-5">
        <label htmlFor="fullname" className="text-[#414844]">
          {t("auth.fullName")}
        </label>
        <input
          id="fullname"
          type="text"
          placeholder={t("auth.fullNamePlaceholder")}
          {...register("fullname")}
          className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
            errors.fullname ? "border-red-500" : "border-[#6B7280]"
          }`}
        />
        {errors.fullname && (
          <span className="mt-2 text-red-500 text-sm">
            {errors.fullname.message}
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
          placeholder={t("auth.usernamePlaceholder")}
          {...register("username")}
          className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
            errors.username ? "border-red-500" : "border-[#6B7280]"
          }`}
        />
        {errors.username && (
          <span className="mt-2 text-red-500 text-sm">
            {errors.username.message}
          </span>
        )}
      </div>

      <div className="flex flex-col mt-5">
        <label htmlFor="email" className="text-[#414844]">
          {t("auth.email")}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          {...register("email")}
          className={`placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white ${
            errors.email ? "border-red-500" : "border-[#6B7280]"
          }`}
        />
        {errors.email && (
          <span className="mt-2 text-red-500 text-sm">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col mt-5">
        <label htmlFor="password" className="text-[#414844]">
          {t("auth.password")}
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
          {t("auth.confirmPassword")}
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
        className="w-full mt-5"
        variant="filled"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("auth.creatingAccount") : t("auth.signUp")}
      </Button>
    </form>
  );
};

export default SignupForm;
