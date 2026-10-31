import { useUser } from "@/lib/hooks/useUser";
import usePermissions from "@/lib/hooks/usePermissions";
import useSession from "@/lib/service/useSession";
import useSessionRegistration from "@/lib/hooks/useSessionRegistration";
import {
  capacityPercent,
  MATERIAL_KIND_KEYS,
  priceLabel,
  registrationBlock,
  REGISTRATION_BLOCK_KEYS,
  SESSION_TYPE_KEYS,
  spotsLeft as spotsLeftOf,
} from "@/lib/utils/session";
import type Session from "@/types/session";
import type { SessionMaterial } from "@/types/session";
import {
  BadgeCheck,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  Clock,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Info,
  Link2,
  ListChecks,
  Lock,
  MapPin,
  Navigation,
  PackageOpen,
  UserPlus,
  Video,
} from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const MATERIAL_ICONS = {
  pdf: FileText,
  excel: FileSpreadsheet,
  video: Video,
  link: Link2,
} as const;

const Instructor = ({ hostId }: { hostId: string }) => {
  const { t } = useTranslation();
  const { user } = useUser(hostId);
  const navigate = useNavigate();

  return (
    <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
      <h2 className="flex items-center gap-2 text-[#012D1D] text-xl font-bold">
        <GraduationCap size={22} />
        {t("session.detail.instructor")}
      </h2>

      <div className="flex gap-4 mt-5">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.displayName}
            className="h-16 w-16 rounded-full object-cover bg-[#E6E9E7] shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-[#E6E9E7] shrink-0 flex items-center justify-center text-lg font-bold text-[#012D1D]">
            {user?.displayName?.[0] ?? "?"}
          </div>
        )}

        <div>
          <p
            className="text-[#191C1B] font-semibold cursor-pointer hover:underline"
            onClick={() =>
              user && navigate(`/community/author/${user.username}`)
            }
          >
            {user?.displayName ?? t("session.tesExpert")}
          </p>
          <p className="text-[#414844] text-sm">
            {user?.role === "spac_consultant"
              ? t("session.detail.seniorSoilScientist")
              : t("session.tesExpert")}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#15803D] bg-[#DCFCE7] rounded-full px-3 py-1">
            <BadgeCheck size={14} />
            {t("session.tesExpert")}
          </span>
          {user?.bio && (
            <p className="text-[#414844] text-sm mt-3">{user.bio}</p>
          )}
        </div>
      </div>
    </section>
  );
};

const Agenda = ({ session }: { session: Session }) => {
  const { t } = useTranslation();
  if (!session.agenda?.length) return null;

  return (
    <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
      <h2 className="flex items-center gap-2 text-[#012D1D] text-xl font-bold">
        <ListChecks size={22} />
        {t("session.detail.agenda")}
      </h2>

      <div className="mt-5 flex flex-col">
        {session.agenda.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row gap-4 py-4 border-b border-[#E5E7EB] last:border-b-0"
          >
            <span className="text-[#414844] text-sm font-medium whitespace-nowrap sm:w-32 shrink-0">
              {item.startsAt} - {item.endsAt}
            </span>
            <div>
              <p className="text-[#191C1B] font-semibold text-sm">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[#414844] text-sm mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Materials = ({ materials }: { materials: SessionMaterial[] }) => {
  const { t } = useTranslation();
  if (!materials.length) return null;
  const anyLocked = materials.some((m) => m.locked);

  return (
    <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
      <h2 className="flex items-center gap-2 text-[#012D1D] text-lg font-bold">
        <PackageOpen size={20} />
        {t("session.detail.materials")}
      </h2>

      <div className="flex flex-col gap-3 mt-4">
        {materials.map((m) => {
          const Icon = MATERIAL_ICONS[m.kind] ?? FileText;
          return (
            <div key={m.id} className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[#F2F4F2] text-[#012D1D]">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[#191C1B] text-sm font-medium">{m.name}</p>
                <p className="text-[#6B7280] text-xs">
                  {t(MATERIAL_KIND_KEYS[m.kind])}
                  {m.size ? ` • ${m.size}` : ""}
                </p>
              </div>
              {m.locked ? (
                <Lock size={16} className="text-[#9CA3AF]" />
              ) : (
                <a
                  href={m.url ?? "#"}
                  className="text-xs text-[#012D1D] underline"
                >
                  {t("common.open")}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {anyLocked && (
        <p className="flex gap-2 items-start text-xs text-[#414844] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-3 mt-4">
          <Info size={14} className="shrink-0 mt-0.5" />
          {t("session.detail.materialsLocked")}
        </p>
      )}
    </section>
  );
};

const LocationCard = ({ session }: { session: Session }) => {
  const { t } = useTranslation();

  if (session.format === "online") {
    return (
      <section className="border border-[#C1C8C2] rounded-xl bg-white overflow-hidden">
        <div className="h-40 bg-[#E6E9E7] flex items-center justify-center text-[#012D1D]">
          <Video size={40} />
        </div>
        <div className="p-6">
          <h3 className="flex items-center gap-2 text-[#191C1B] font-semibold text-sm">
            <Video size={16} />
            {t("session.detail.onlineSession")}
          </h3>
          <p className="text-[#414844] text-sm mt-1">
            {t("session.detail.onlineSessionText")}
          </p>
        </div>
      </section>
    );
  }

  const query = encodeURIComponent(
    session.venueAddress ?? session.location ?? session.region?.oblast ?? "",
  );

  return (
    <section className="border border-[#C1C8C2] rounded-xl bg-white overflow-hidden">
      <div className="h-40 bg-[#E6E9E7] flex items-center justify-center text-[#DC2626]">
        <MapPin size={40} />
      </div>
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-[#191C1B] font-semibold text-sm">
          <MapPin size={16} />
          {t("session.detail.location")}
        </h3>
        <p className="text-[#191C1B] text-sm mt-2 font-medium">
          {session.location ?? session.region?.oblast}
        </p>
        {session.venueAddress && (
          <p className="text-[#414844] text-sm">{session.venueAddress}</p>
        )}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 border border-[#C1C8C2] rounded-md py-2 mt-4 text-sm text-[#191C1B] hover:bg-[#F9FAFB]"
        >
          <Navigation size={16} />
          {t("session.detail.getDirections")}
        </a>
      </div>
    </section>
  );
};

const SessionDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isGuest } = usePermissions();
  const { session, isLoading, error } = useSession(slug ?? "");
  const { isRegistered, needsPayment } = useSessionRegistration(slug ?? "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-10 py-20 text-[#414844]">
        {t("session.detail.loading")}
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto px-10 py-10">
        <h1 className="text-[#012D1D] text-3xl font-bold">
          {t("session.detail.notFound")}
        </h1>
        <p className="text-[#414844] mt-2">
          {t("session.detail.notFoundText")}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-6 text-[#012D1D] font-semibold cursor-pointer"
        >
          <ChevronLeft size={18} />
          {t("session.detail.goBack")}
        </button>
      </div>
    );
  }

  const percent = capacityPercent(session.registeredCount, session.capacity);
  const spotsLeft = spotsLeftOf(session);

  // One shared guard for the button state and the API, so they can never
  // disagree about whether a seat is still available.
  const block = registrationBlock(session);
  const isFull = block === "full";

  // An existing registration always wins: a registered user must still be able
  // to reach their confirmation even once the session has filled up or closed.
  const registerLabel = isRegistered
    ? needsPayment
      ? t("session.detail.register.completePayment")
      : t("session.detail.register.registered")
    : block
      ? t(REGISTRATION_BLOCK_KEYS[block])
      : isGuest
        ? t("session.detail.register.guest")
        : t("session.detail.register.open");

  const registerDisabled = !isRegistered && Boolean(block);

  const goRegister = () => {
    if (isRegistered) {
      navigate(
        needsPayment
          ? `/sessions/${session.slug}/checkout`
          : `/sessions/${session.slug}/confirmation`,
      );
      return;
    }

    const target = `/sessions/${session.slug}/register`;
    // Guests sign in first, then land back on the registration form.
    navigate(
      isGuest ? `/auth?next=${encodeURIComponent(target)}` : target,
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-20">
      <button
        onClick={() => navigate("/sessions")}
        className="flex items-center gap-1 text-sm text-[#414844] hover:text-[#012D1D] cursor-pointer"
      >
        <ChevronLeft size={16} />
        {t("session.detail.allSessions")}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 mt-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#B45309] text-xs px-3 py-1 rounded-full">
              <UserPlus size={14} />
              {t(SESSION_TYPE_KEYS[session.sessionType])}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#414844]">
              <CalendarDays size={14} />
              {moment(session.startsAt).format("MMM DD, YYYY")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#414844]">
              <Clock size={14} />
              {moment(session.startsAt).format("HH:mm")} –{" "}
              {moment(session.endsAt).format("HH:mm")}
            </span>
          </div>

          <h1 className="text-[#012D1D] text-4xl lg:text-5xl font-bold mt-4">
            {session.title}
          </h1>

          <p className="text-[#414844] mt-4 max-w-2xl">{session.description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={goRegister}
              disabled={registerDisabled}
              className="flex items-center gap-2 bg-[#012D1D] text-white px-6 py-3 rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              <UserPlus size={18} />
              {registerLabel}
            </button>
            <button className="flex items-center gap-2 border border-[#C1C8C2] text-[#191C1B] px-6 py-3 rounded-md font-semibold cursor-pointer hover:bg-[#F9FAFB]">
              <Bookmark size={18} />
              {t("session.detail.saveForLater")}
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-[#E6E9E7] min-h-56">
          {session.coverImage ? (
            <img
              src={session.coverImage}
              alt={session.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[#9CA3AF]">
              <CalendarDays size={48} />
            </div>
          )}
          {(session.location || session.region?.oblast) && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/55 text-white text-xs px-3 py-1.5 rounded-full">
              <MapPin size={14} />
              {session.location ?? session.region?.oblast}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-10">
        <div className="flex flex-col gap-6">
          <Instructor hostId={session.hostId} />
          <Agenda session={session} />
        </div>

        <aside className="flex flex-col gap-6">
          <LocationCard session={session} />
          <Materials materials={session.materials ?? []} />

          <section className="bg-[#012D1D] rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold">
              {isFull
                ? t("session.detail.sessionFull")
                : t("session.detail.limitedSpots")}
            </h3>
            <p className="text-[#A7C3B4] text-sm mt-1">
              {session.isCanceled
                ? t("session.detail.wasCanceled")
                : session.registrationClosesAt
                  ? t("session.detail.registrationCloses", {
                      date: moment(session.registrationClosesAt).format(
                        "MMM D",
                      ),
                    })
                  : t("session.detail.spotsLeft", {
                      left: spotsLeft,
                      capacity: session.capacity,
                    })}
            </p>
            <div className="w-full rounded-xl bg-[#0b3d2a] h-2 overflow-hidden mt-4">
              <div
                className="h-2 rounded-xl bg-[#22C55E]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <button
              onClick={goRegister}
              disabled={registerDisabled}
              className="w-full bg-[#1F7A4D] text-white py-3 rounded-md font-semibold mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              {registerLabel}
            </button>
            <p className="text-[#A7C3B4] text-xs mt-3">
              {priceLabel(session.pricing, t)}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default SessionDetail;
