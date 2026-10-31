import {
  ChevronLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useAuth from "@/lib/hooks/useAuth";
import useSessionRegistration from "@/lib/hooks/useSessionRegistration";
import useToast from "@/lib/hooks/useToast";
import useSession from "@/lib/service/useSession";
import { priceLabel } from "@/lib/utils/session";

const METHODS = ["card", "elsom", "invoice"] as const;
type Method = (typeof METHODS)[number];

const SessionCheckout = () => {
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
    pay,
  } = useSessionRegistration(slug);

  const [method, setMethod] = useState<Method>("card");

  if (!user) {
    return <Navigate to={`/auth?next=/sessions/${slug}/checkout`} replace />;
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

  // Nothing to pay for until a seat has actually been held.
  if (!registration) {
    return <Navigate to={`/sessions/${slug}/register`} replace />;
  }

  // Free or already-settled registrations skip payment entirely.
  if (registration.paymentStatus !== "pending") {
    return <Navigate to={`/sessions/${slug}/confirmation`} replace />;
  }

  const onPay = async () => {
    const paid = await pay();
    if (!paid) {
      errorToast(
        t("session.checkout.toast.errorTitle"),
        t("session.checkout.toast.errorBody"),
      );
      return;
    }
    success(
      t("session.checkout.toast.successTitle"),
      t("session.checkout.toast.successBody", { title: session.title }),
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
        {t("session.checkout.title")}
      </h1>
      <p className="mt-2 text-[#414844]">{t("session.checkout.subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-[#C1C8C2] bg-white p-6">
          <h2 className="flex items-center gap-2 font-semibold text-[#191C1B]">
            <CreditCard size={18} />
            {t("session.checkout.paymentMethod")}
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {METHODS.map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  method === value
                    ? "border-[#012D1D] bg-[#F1F7F3]"
                    : "border-[#C1C8C2] hover:bg-[#F9FAFB]"
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={value}
                  checked={method === value}
                  onChange={() => setMethod(value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#012D1D]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#191C1B]">
                    {t(`session.checkout.methods.${value}.label`)}
                  </span>
                  <span className="block text-sm text-[#414844]">
                    {t(`session.checkout.methods.${value}.hint`)}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#414844]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            {t("session.checkout.demoNotice")}
          </p>

          <button
            type="button"
            onClick={() => void onPay()}
            disabled={isMutating}
            className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#012D1D] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock size={16} />
            {isMutating
              ? t("session.checkout.processing")
              : t("session.checkout.payNow", {
                  amount: priceLabel(session.pricing, t),
                })}
          </button>
        </section>

        <aside className="h-fit rounded-xl border border-[#C1C8C2] bg-white p-6 lg:sticky lg:top-28">
          <h2 className="flex items-center gap-2 font-semibold text-[#191C1B]">
            <Ticket size={18} />
            {t("session.checkout.orderSummary")}
          </h2>

          <p className="mt-4 text-sm font-semibold text-[#012D1D]">
            {session.title}
          </p>
          <p className="mt-1 text-sm text-[#414844]">
            {registration.attendee.fullName}
          </p>
          <p className="text-sm text-[#414844]">{registration.attendee.email}</p>

          <div className="mt-5 flex items-center justify-between border-t border-[#ECEEEC] pt-4">
            <span className="text-sm text-[#414844]">
              {t("session.register.total")}
            </span>
            <span className="text-lg font-bold text-[#012D1D]">
              {priceLabel(session.pricing, t)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SessionCheckout;
