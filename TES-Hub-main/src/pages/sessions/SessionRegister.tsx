import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  CreditCard,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import useAuth from "@/lib/hooks/useAuth";
import useSessionRegistration from "@/lib/hooks/useSessionRegistration";
import useToast from "@/lib/hooks/useToast";
import useSession from "@/lib/service/useSession";
import {
  priceLabel,
  registrationBlock,
  REGISTRATION_BLOCK_KEYS,
  spotsLeft,
} from "@/lib/utils/session";
import type Session from "@/types/session";

type Translate = (key: string) => string;

const buildSchema = (t: Translate) =>
  z.object({
    fullName: z.string().trim().min(2, t("session.register.errors.fullName")),
    email: z.email(t("session.register.errors.email")),
    phone: z
      .string()
      .trim()
      // Deliberately permissive: KG numbers are written in many shapes.
      .regex(/^\+?[\d\s()-]{9,20}$/, t("session.register.errors.phone")),
    notes: z
      .string()
      .trim()
      .max(500, t("session.register.errors.notes"))
      .optional(),
    consent: z.literal(true, t("session.register.errors.consent")),
  });

type FormData = z.infer<ReturnType<typeof buildSchema>>;

const fieldClass = (hasError: boolean) =>
  `mt-1 w-full rounded-md border bg-white p-3 text-sm outline-none focus:border-[#012D1D] ${
    hasError ? "border-[#BA1A1A]" : "border-[#C1C8C2]"
  }`;

const SessionSummary = ({ session }: { session: Session }) => {
  const { t } = useTranslation();
  const left = spotsLeft(session);

  return (
    <aside className="h-fit rounded-xl border border-[#C1C8C2] bg-white p-6 lg:sticky lg:top-28">
      {session.coverImage && (
        <img
          src={session.coverImage}
          alt={session.title}
          className="mb-4 h-32 w-full rounded-lg object-cover"
        />
      )}
      <h2 className="text-lg font-bold text-[#012D1D]">{session.title}</h2>

      <dl className="mt-4 flex flex-col gap-3 text-sm text-[#414844]">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="shrink-0" />
          <span>{moment(session.startsAt).format("dddd, MMM DD, YYYY")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="shrink-0" />
          <span>
            {moment(session.startsAt).format("HH:mm")} –{" "}
            {moment(session.endsAt).format("HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0" />
          <span>
            {session.format === "online"
              ? t("session.online")
              : (session.location ??
                session.region?.oblast ??
                t("session.inPerson"))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="shrink-0" />
          <span>{t("session.spotsLeftShort", { count: left })}</span>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-[#ECEEEC] pt-4">
        <span className="text-sm text-[#414844]">
          {t("session.register.total")}
        </span>
        <span className="text-lg font-bold text-[#012D1D]">
          {priceLabel(session.pricing, t)}
        </span>
      </div>
    </aside>
  );
};

const SessionRegister = () => {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuth();
  const { success, error: errorToast } = useToast();

  const { session, isLoading, error } = useSession(slug);
  const {
    registration,
    isLoading: loadingRegistration,
    isMutating,
    register: submitRegistration,
  } = useSessionRegistration(slug);

  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", notes: "" },
  });

  // The signed-in user's details are only known once the store has hydrated.
  useEffect(() => {
    if (!user) return;
    reset((current) => ({
      ...current,
      fullName: current.fullName || user.displayName,
      email: current.email || user.email,
    }));
  }, [user, reset]);

  // Guests must sign in first, but we come straight back here afterwards.
  if (!user) {
    return <Navigate to={`/auth?next=/sessions/${slug}/register`} replace />;
  }

  if (isLoading || loadingRegistration) {
    return (
      <div className="container mx-auto px-10 py-20 text-[#414844]">
        {t("session.detail.loading")}
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold text-[#012D1D]">
          {t("session.detail.notFound")}
        </h1>
        <p className="mt-2 text-[#414844]">{t("session.detail.notFoundText")}</p>
        <button
          onClick={() => navigate("/sessions")}
          className="mt-6 flex cursor-pointer items-center gap-2 font-semibold text-[#012D1D]"
        >
          <ChevronLeft size={18} />
          {t("session.detail.allSessions")}
        </button>
      </div>
    );
  }

  // Already holding a seat: send them to the page that matches their state
  // instead of letting them register twice.
  if (registration) {
    return (
      <Navigate
        to={
          registration.paymentStatus === "pending"
            ? `/sessions/${slug}/checkout`
            : `/sessions/${slug}/confirmation`
        }
        replace
      />
    );
  }

  const block = registrationBlock(session);
  const isPaid =
    session.pricing.model !== "free" && Boolean(session.pricing.amount);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const created = await submitRegistration({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    });

    if (!created) {
      errorToast(
        t("session.register.toast.errorTitle"),
        t("session.register.toast.errorBody"),
      );
      return;
    }

    if (created.paymentStatus === "pending") {
      success(
        t("session.register.toast.heldTitle"),
        t("session.register.toast.heldBody"),
      );
      navigate(`/sessions/${slug}/checkout`, { replace: true });
      return;
    }

    success(
      t("session.register.toast.successTitle", { title: session.title }),
      t("session.register.toast.successBody"),
    );
    navigate(`/sessions/${slug}/confirmation`, { replace: true });
  };

  return (
    <div className="container mx-auto px-4 pt-6 pb-20 sm:px-6 lg:px-10">
      <button
        onClick={() => navigate(`/sessions/${slug}`)}
        className="flex cursor-pointer items-center gap-1 text-sm text-[#414844] hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} />
        {t("session.register.backToSession")}
      </button>

      <h1 className="mt-4 text-3xl font-bold text-[#012D1D] lg:text-4xl">
        {t("session.register.title")}
      </h1>
      <p className="mt-2 text-[#414844]">{t("session.register.subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {block ? (
          <div className="rounded-xl border border-[#C1C8C2] bg-white p-6">
            <h2 className="text-lg font-semibold text-[#191C1B]">
              {t(REGISTRATION_BLOCK_KEYS[block])}
            </h2>
            <p className="mt-2 text-sm text-[#414844]">
              {t(`session.register.blocked.${block}`)}
            </p>
            <button
              onClick={() => navigate("/sessions")}
              className="mt-6 cursor-pointer rounded-md bg-[#012D1D] px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              {t("session.register.browseOthers")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5 rounded-xl border border-[#C1C8C2] bg-white p-6"
          >
            <div>
              <label htmlFor="fullName" className="text-sm text-[#414844]">
                {t("session.register.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
                className={fieldClass(Boolean(errors.fullName))}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-[#BA1A1A]">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="text-sm text-[#414844]">
                {t("session.register.email")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
                className={fieldClass(Boolean(errors.email))}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#BA1A1A]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm text-[#414844]">
                {t("session.register.phone")}
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+996 555 123 456"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
                className={fieldClass(Boolean(errors.phone))}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-[#BA1A1A]">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="text-sm text-[#414844]">
                {t("session.register.notes")}{" "}
                <span className="text-[#6B7280]">({t("common.optional")})</span>
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register("notes")}
                className={`${fieldClass(Boolean(errors.notes))} resize-y`}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-[#BA1A1A]">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 text-sm text-[#414844]">
                <input
                  type="checkbox"
                  {...register("consent")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#012D1D]"
                />
                {t("session.register.consent")}
              </label>
              {errors.consent && (
                <p className="mt-1 text-sm text-[#BA1A1A]">
                  {errors.consent.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isMutating}
              className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#012D1D] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPaid ? <CreditCard size={18} /> : <UserPlus size={18} />}
              {isMutating
                ? t("session.register.submitting")
                : isPaid
                  ? t("session.register.continueToPayment")
                  : t("session.register.confirmSpot")}
            </button>
          </form>
        )}

        <SessionSummary session={session} />
      </div>
    </div>
  );
};

export default SessionRegister;
