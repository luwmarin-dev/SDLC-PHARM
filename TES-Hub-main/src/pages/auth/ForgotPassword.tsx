import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../../components/ui/button";
import axiosInstance from "../../lib/api/apiClient";
import AuthShell from "./components/AuthShell";
import { messageOf } from "@/lib/utils/errors";

const buildSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t("auth.errors.emailInvalid")),
  });

type SchemaProps = z.infer<ReturnType<typeof buildSchema>>;

const ForgotPassword = () => {
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
      await axiosInstance.post("/auth/forgot-password", { email: data.email });
      navigate("/auth/verify-email", {
        state: { flow: "forgot", email: data.email },
      });
    } catch (err) {
      setServerError(messageOf(err, t("auth.genericError")));
    }
  };

  return (
    <AuthShell>
      <h2 className="text-[#012D1D] font-bold text-4xl">
        {t("auth.forgot.title")}
      </h2>
      <p className="text-[#414844] text-base mt-3">
        {t("auth.forgot.subtitle")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <div className="flex flex-col">
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

        {serverError && (
          <p className="mt-3 text-red-500 text-sm">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full mt-6"
          variant="filled"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common.sending") : t("auth.forgot.send")}
        </Button>

        <p className="text-center mt-4 text-[#414844] text-sm">
          {t("auth.forgot.remember")}{" "}
          <span
            className="text-[#1F6D1A] font-semibold cursor-pointer"
            onClick={() => navigate("/auth")}
          >
            {t("auth.logIn")}
          </span>
        </p>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
