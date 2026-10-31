import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Link2,
  MapPin,
  Users,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "@/components/ui/confirmDialog";
import useAuth from "@/lib/hooks/useAuth";
import useSessionRegistration from "@/lib/hooks/useSessionRegistration";
import useToast from "@/lib/hooks/useToast";
import useSession from "@/lib/service/useSession";

const SessionRegisterConfirmation = () => {
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
    cancel,
  } = useSessionRegistration(slug);

  const [isConfirmOpen, setConfirmOpen] = useState(false);

  if (!user) {
    return <Navigate to={`/auth?next=/sessions/${slug}/confirmation`} replace />;
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
      </div>
    );
  }

  // Landing here without a seat (or after cancelling) means the flow restarts.
  if (!registration) {
    return <Navigate to={`/sessions/${slug}/register`} replace />;
  }

  // A held-but-unpaid seat is not confirmed yet.
  if (registration.paymentStatus === "pending") {
    return <Navigate to={`/sessions/${slug}/checkout`} replace />;
  }

  const onCancel = async () => {
    setConfirmOpen(false);
    const done = await cancel();
    if (!done) {
      errorToast(
        t("session.confirmation.toast.cancelErrorTitle"),
        t("session.confirmation.toast.cancelErrorBody"),
      );
      return;
    }
    success(
      t("session.confirmation.toast.canceledTitle"),
      t("session.confirmation.toast.canceledBody", { title: session.title }),
    );
    navigate(`/sessions/${slug}`, { replace: true });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-[#012D1D] lg:text-4xl">
          {t("session.confirmation.title")}
        </h1>
        <p className="mt-2 max-w-xl text-[#414844]">
          {t("session.confirmation.subtitle", {
            email: registration.attendee.email,
          })}
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-[#C1C8C2] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-[#012D1D]">{session.title}</h2>
          <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#15803D]">
            {t(`session.confirmation.status.${registration.paymentStatus}`)}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 text-sm text-[#414844] sm:grid-cols-2">
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
            <span>{registration.attendee.fullName}</span>
          </div>
        </dl>

        {session.format === "online" && session.meetingUrl && (
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#012D1D] underline"
          >
            <Link2 size={16} />
            {t("session.confirmation.joinLink")}
          </a>
        )}

        <p className="mt-5 text-xs text-[#6B7280]">
          {t("session.confirmation.reference", { id: registration.id })}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-[#C1C8C2] bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold text-[#191C1B]">
          <Bell size={18} />
          {t("session.confirmation.whatNext")}
        </h3>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-[#414844]">
          <li>{t("session.confirmation.step1")}</li>
          <li>{t("session.confirmation.step2")}</li>
          <li>{t("session.confirmation.step3")}</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/notifications"
          className="rounded-md bg-[#012D1D] px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          {t("session.confirmation.viewNotifications")}
        </Link>
        <Link
          to="/sessions"
          className="rounded-md border border-[#C1C8C2] px-6 py-3 font-semibold text-[#191C1B] hover:bg-[#F9FAFB]"
        >
          {t("session.confirmation.browseMore")}
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isMutating}
          className="cursor-pointer rounded-md px-6 py-3 font-semibold text-[#BA1A1A] hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("session.confirmation.cancelRegistration")}
        </button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("session.confirmation.cancelTitle")}
        message={t("session.confirmation.cancelText", {
          title: session.title,
        })}
        confirmLabel={t("session.confirmation.cancelRegistration")}
        cancelLabel={t("common.back")}
        tone="danger"
        onConfirm={() => void onCancel()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default SessionRegisterConfirmation;
