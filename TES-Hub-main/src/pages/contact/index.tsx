import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

import Button from "../../components/ui/button";
import axiosInstance from "../../lib/api/apiClient";
import { messageOf } from "@/lib/utils/errors";

const SUBJECTS = [
  "general",
  "account",
  "verification",
  "feedback",
  "problem",
  "partnership",
] as const;

const buildSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("contact.errors.name")),
    email: z.email(t("contact.errors.email")),
    subject: z.enum(SUBJECTS, t("contact.errors.subject")),
    message: z
      .string()
      .min(20, t("contact.errors.messageMin"))
      .max(2000, t("contact.errors.messageMax")),
  });

type SchemaProps = z.infer<ReturnType<typeof buildSchema>>;

const Contact = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const schema = useMemo(() => buildSchema(t), [t]);

  const DETAILS = [
    {
      icon: Mail,
      title: t("contact.details.emailTitle"),
      lines: ["support@tesknowledgehub.org"],
    },
    {
      icon: Phone,
      title: t("contact.details.phoneTitle"),
      lines: ["+996 (312) 00-00-00"],
    },
    {
      icon: MapPin,
      title: t("contact.details.visitTitle"),
      lines: [t("contact.details.visitLine1"), t("contact.details.visitLine2")],
    },
    {
      icon: Clock,
      title: t("contact.details.hoursTitle"),
      lines: [t("contact.details.hoursLine1"), t("contact.details.hoursLine2")],
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SchemaProps> = async (data) => {
    setServerError("");
    try {
      await axiosInstance.post("/contact", data);
      reset();
      setIsSent(true);
    } catch (err) {
      setServerError(messageOf(err, t("contact.genericError")));
    }
  };

  const fieldStyles = (hasError: boolean) =>
    `placeholder:text-[#6B7280] p-3 py-2 outline-none border mt-1 bg-white rounded-sm ${
      hasError ? "border-red-500" : "border-[#6B7280]"
    }`;

  return (
    <div className="container mx-auto py-5 px-6 md:px-10">
      <header>
        <h1 className="text-[#012D1D] font-bold text-4xl md:text-5xl">
          {t("contact.title")}
        </h1>
        <p className="text-[#414844] text-lg mt-4 max-w-2xl">
          {t("contact.description")}
        </p>
        <div className="h-px w-full bg-[#C1C8C2] mt-8"></div>
      </header>

      <div className="flex flex-col lg:flex-row mt-12 lg:mt-16 gap-6 items-start">
        <section className="w-full lg:w-[65%] p-6 md:p-10 border-2 border-[#C1C8C2] rounded-lg bg-white">
          {isSent ? (
            <div className="flex flex-col items-center text-center py-10">
              <CheckCircle2 size={40} className="text-[#1B4332]" />
              <h2 className="text-[#012D1D] font-bold text-2xl mt-4">
                {t("contact.sentTitle")}
              </h2>
              <p className="text-[#414844] text-sm leading-6 mt-3 max-w-md">
                {t("contact.sentText")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => setIsSent(false)}
              >
                {t("contact.sendAnother")}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-[#012D1D] font-bold text-2xl">
                {t("contact.formTitle")}
              </h2>
              <p className="text-[#414844] text-sm leading-6 mt-2">
                {t("contact.formNote")}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 flex flex-col gap-5"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex flex-col flex-1">
                    <label htmlFor="name" className="text-[#414844]">
                      {t("contact.name")}
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder={t("contact.namePlaceholder")}
                      {...register("name")}
                      className={fieldStyles(!!errors.name)}
                    />
                    {errors.name && (
                      <span className="mt-2 text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <label htmlFor="email" className="text-[#414844]">
                      {t("contact.email")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder={t("contact.emailPlaceholder")}
                      {...register("email")}
                      className={fieldStyles(!!errors.email)}
                    />
                    {errors.email && (
                      <span className="mt-2 text-red-500 text-sm">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="subject" className="text-[#414844]">
                    {t("contact.subject")}
                  </label>
                  <select
                    id="subject"
                    defaultValue=""
                    {...register("subject")}
                    className={fieldStyles(!!errors.subject)}
                  >
                    <option value="" disabled>
                      {t("contact.subjectPlaceholder")}
                    </option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {t(`contact.subjects.${subject}`)}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <span className="mt-2 text-red-500 text-sm">
                      {errors.subject.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="message" className="text-[#414844]">
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    rows={7}
                    placeholder={t("contact.messagePlaceholder")}
                    {...register("message")}
                    className={`${fieldStyles(!!errors.message)} resize-y`}
                  />
                  {errors.message && (
                    <span className="mt-2 text-red-500 text-sm">
                      {errors.message.message}
                    </span>
                  )}
                </div>

                {serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}

                <Button
                  type="submit"
                  variant="filled"
                  className="w-full md:w-auto md:self-start"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.sending") : t("contact.send")}
                </Button>

                <p className="text-[#414844] text-sm leading-6">
                  {t("contact.agreePrefix")}{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-[#1F6D1A] font-semibold"
                  >
                    {t("legal.nav.terms")}
                  </Link>{" "}
                  {t("contact.agreeMiddle")}{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-[#1F6D1A] font-semibold"
                  >
                    {t("legal.nav.privacy")}
                  </Link>
                  .
                </p>
              </form>
            </>
          )}
        </section>

        <aside className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="p-6 border-2 border-[#C1C8C2] rounded-lg bg-white">
            <h2 className="text-[#191C1B] text-sm font-semibold tracking-wide">
              {t("contact.detailsTitle")}
            </h2>

            <div className="flex flex-col gap-5 mt-5">
              {DETAILS.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex gap-3">
                  <Icon size={20} className="text-[#1B4332] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[#012D1D] text-sm font-semibold">
                      {title}
                    </h3>
                    {lines.map((line) => (
                      <p key={line} className="text-[#414844] text-sm mt-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-2 border-[#C1C8C2] rounded-lg bg-white">
            <h2 className="text-[#191C1B] text-sm font-semibold tracking-wide">
              {t("contact.beforeTitle")}
            </h2>
            <p className="text-[#414844] text-sm leading-6 mt-3">
              {t("contact.beforeText")}
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Link
                to="/community/questions"
                className="text-[#414844] text-sm py-2 px-3 rounded-sm font-semibold hover:bg-[#f8faf8] transition-colors"
              >
                {t("contact.linkQuestions")}
              </Link>
              <Link
                to="/academy"
                className="text-[#414844] text-sm py-2 px-3 rounded-sm font-semibold hover:bg-[#f8faf8] transition-colors"
              >
                {t("contact.linkAcademy")}
              </Link>
              <Link
                to="/terms-of-service"
                className="text-[#414844] text-sm py-2 px-3 rounded-sm font-semibold hover:bg-[#f8faf8] transition-colors"
              >
                {t("contact.linkTerms")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Contact;
