import useSessions from "@/lib/hooks/useSessions";
import { useUser } from "@/lib/hooks/useUser";
import {
  capacityPercent,
  getLifecycle,
  priceLabel,
  SESSION_TYPE_KEYS,
} from "@/lib/utils/session";
import type Session from "@/types/session";
import { SESSION_FORMATS, type SessionFormat } from "@/types/session";
import {
  CalendarDays,
  Clock,
  LayoutList,
  MapPin,
  MonitorSmartphone,
  Video,
} from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type PriceFilter = "any" | "free" | "paid";
type View = "list" | "calendar";

interface FilterProps {
  formats: SessionFormat[];
  toggleFormat: (f: SessionFormat) => void;
  region: string;
  setRegion: (r: string) => void;
  price: PriceFilter;
  setPrice: (p: PriceFilter) => void;
  regions: string[];
  onClear: () => void;
}

const FilterPanel = ({
  formats,
  toggleFormat,
  region,
  setRegion,
  price,
  setPrice,
  regions,
  onClear,
}: FilterProps) => {
  const { t } = useTranslation();

  return (
    <aside className="border border-[#C1C8C2] rounded-xl bg-white p-6 h-max lg:sticky lg:top-30">
      <div className="flex items-center justify-between">
        <h3 className="text-[#012D1D] text-xl font-bold">
          {t("session.filters.title")}
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-[#414844] underline cursor-pointer hover:text-[#012D1D]"
        >
          {t("session.filters.clearAll")}
        </button>
      </div>

      <div className="mt-6">
        <h4 className="text-[#191C1B] text-sm font-semibold">
          {t("session.filters.format")}
        </h4>
        <div className="flex flex-col gap-3 mt-3">
          {SESSION_FORMATS.map((f) => (
            <label
              key={f}
              className="flex items-center gap-3 text-sm text-[#414844] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formats.includes(f)}
                onChange={() => toggleFormat(f)}
                className="h-4 w-4 accent-[#012D1D]"
              />
              {t(`session.format.${f}`)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-[#191C1B] text-sm font-semibold">
          {t("session.filters.region")}
        </h4>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full mt-3 border border-[#C1C8C2] rounded-md h-11 px-3 text-sm outline-none bg-white"
        >
          <option value="all">{t("session.filters.allRegions")}</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <h4 className="text-[#191C1B] text-sm font-semibold">
          {t("session.filters.price")}
        </h4>
        <div className="flex flex-col gap-3 mt-3">
          {(
            [
              ["any", t("session.filters.anyPrice")],
              ["free", t("session.filters.free")],
              ["paid", t("session.filters.paid")],
            ] as [PriceFilter, string][]
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-3 text-sm text-[#414844] cursor-pointer"
            >
              <input
                type="radio"
                name="price"
                checked={price === value}
                onChange={() => setPrice(value)}
                className="h-4 w-4 accent-[#012D1D]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

const HostLine = ({ session }: { session: Session }) => {
  const { t } = useTranslation();
  const { user } = useUser(session.hostId);
  const prefix =
    session.sessionType === "webinar" ? t("session.guestExpert") : "";

  return (
    <div className="flex items-center gap-2">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.displayName}
          className="h-7 w-7 rounded-full object-cover bg-[#E6E9E7]"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-[#E6E9E7] flex items-center justify-center text-[10px] font-bold text-[#012D1D]">
          {user?.displayName?.[0] ?? "?"}
        </div>
      )}
      <span className="text-sm text-[#414844]">
        {prefix} {user?.displayName ?? t("session.tesExpert")}
      </span>
    </div>
  );
};

const SessionRow = ({ session }: { session: Session }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const percent = capacityPercent(session.registeredCount, session.capacity);
  const isAlmostFull = percent >= 85;
  const isFull = percent >= 100;
  const free = session.pricing.model === "free";

  return (
    <article className="flex flex-col sm:flex-row border border-[#C1C8C2] rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
      <div className="sm:w-56 shrink-0 bg-[#E6E9E7] relative min-h-40">
        {session.coverImage ? (
          <img
            src={session.coverImage}
            alt={session.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#9CA3AF]">
            <MonitorSmartphone size={40} />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-[#012D1D] text-white text-xs px-3 py-1 rounded-full">
          {t(SESSION_TYPE_KEYS[session.sessionType])}
        </span>
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3
            onClick={() => navigate(`/sessions/${session.slug}`)}
            className="text-[#012D1D] text-2xl font-bold cursor-pointer hover:underline"
          >
            {session.title}
          </h3>
          <span
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border ${
              free
                ? "bg-[#DCFCE7] text-[#15803D] border-[#DCFCE7]"
                : "border-[#C1C8C2] text-[#191C1B]"
            }`}
          >
            {priceLabel(session.pricing, t)}
          </span>
        </div>

        <p className="text-[#414844] text-sm mt-2 line-clamp-2">
          {session.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-[#414844]">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={16} />
            {moment(session.startsAt).format("MMM DD, YYYY")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} />
            {moment(session.startsAt).format("HH:mm")} –{" "}
            {moment(session.endsAt).format("HH:mm")}
          </span>
          <span className="flex items-center gap-1.5">
            {session.format === "online" ? (
              <>
                <Video size={16} />
                {t("session.online")}
              </>
            ) : (
              <>
                <MapPin size={16} />
                {session.location ??
                  session.region?.oblast ??
                  t("session.inPerson")}
              </>
            )}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#414844]">
              {t("session.capacityFilled", {
                registered: session.registeredCount,
                capacity: session.capacity,
              })}
            </span>
            <span
              className={`font-semibold ${
                isFull
                  ? "text-[#DC2626]"
                  : isAlmostFull
                    ? "text-[#DC2626]"
                    : "text-[#15803D]"
              }`}
            >
              {isFull
                ? t("session.full")
                : isAlmostFull
                  ? t("session.almostFull")
                  : t("session.available")}
            </span>
          </div>
          <div className="w-full rounded-xl bg-[#E6E9E7] h-2 overflow-hidden mt-2">
            <div
              className={`h-2 rounded-xl ${
                isAlmostFull ? "bg-[#F48C24]" : "bg-[#22C55E]"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <HostLine session={session} />
          {isFull ? (
            <button
              onClick={() => navigate(`/sessions/${session.slug}`)}
              className="border-2 border-[#012D1D] text-[#012D1D] px-5 py-2 rounded-md text-sm font-semibold cursor-pointer"
            >
              {t("session.viewDetails")}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/sessions/${session.slug}/register`)}
              className="bg-[#012D1D] text-white px-5 py-2 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90"
            >
              {t("session.registerNow")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const CalendarView = ({ sessions }: { sessions: Session[] }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cursor, setCursor] = useState(moment().startOf("month"));

  const start = cursor.clone().startOf("month").startOf("isoWeek");
  const end = cursor.clone().endOf("month").endOf("isoWeek");

  const days: moment.Moment[] = [];
  for (let d = start.clone(); d.isSameOrBefore(end); d.add(1, "day")) {
    days.push(d.clone());
  }

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((s) => {
      const key = moment(s.startsAt).format("YYYY-MM-DD");
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return map;
  }, [sessions]);

  return (
    <div className="border border-[#C1C8C2] rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCursor(cursor.clone().subtract(1, "month"))}
          className="px-3 py-1.5 border border-[#C1C8C2] rounded-md text-sm cursor-pointer hover:bg-[#F9FAFB]"
        >
          {t("session.calendar.prev")}
        </button>
        <h3 className="text-[#012D1D] text-lg font-bold">
          {cursor.format("MMMM YYYY")}
        </h3>
        <button
          onClick={() => setCursor(cursor.clone().add(1, "month"))}
          className="px-3 py-1.5 border border-[#C1C8C2] rounded-md text-sm cursor-pointer hover:bg-[#F9FAFB]"
        >
          {t("session.calendar.next")}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px mt-6 text-xs text-[#6B7280] font-semibold">
        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
          <div key={d} className="p-2 text-center">
            {t(`session.calendar.${d}`)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-md overflow-hidden">
        {days.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const dayItems = byDay.get(key) ?? [];
          const inMonth = day.month() === cursor.month();

          return (
            <div
              key={key}
              className={`min-h-24 bg-white p-2 ${inMonth ? "" : "bg-[#F9FAFB] text-[#9CA3AF]"}`}
            >
              <span className="text-xs font-semibold">{day.format("D")}</span>
              <div className="flex flex-col gap-1 mt-1">
                {dayItems.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/sessions/${s.slug}`)}
                    title={s.title}
                    className="text-left text-[10px] bg-[#DCFCE7] text-[#15803D] rounded px-1.5 py-1 truncate cursor-pointer hover:bg-[#bff3d0]"
                  >
                    {moment(s.startsAt).format("HH:mm")} {s.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sessions = () => {
  const { t } = useTranslation();
  const { published, isLoading, error } = useSessions();

  const [view, setView] = useState<View>("list");
  const [formats, setFormats] = useState<SessionFormat[]>([]);
  const [region, setRegion] = useState("all");
  const [price, setPrice] = useState<PriceFilter>("any");

  const available = useMemo(
    () =>
      (published ?? [])
        .filter((s) => !s.isCanceled && getLifecycle(s) !== "completed")
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [published],
  );

  const regions = useMemo(
    () =>
      [
        ...new Set(
          available.map((s) => s.region?.oblast).filter(Boolean) as string[],
        ),
      ].sort(),
    [available],
  );

  const filtered = useMemo(
    () =>
      available.filter((s) => {
        const matchesFormat =
          formats.length === 0 || formats.includes(s.format);
        const matchesRegion = region === "all" || s.region?.oblast === region;
        const isFree = s.pricing.model === "free";
        const matchesPrice =
          price === "any" ||
          (price === "free" && isFree) ||
          (price === "paid" && !isFree);
        return matchesFormat && matchesRegion && matchesPrice;
      }),
    [available, formats, region, price],
  );

  const toggleFormat = (f: SessionFormat) =>
    setFormats((list) =>
      list.includes(f) ? list.filter((x) => x !== f) : [...list, f],
    );

  const clearAll = () => {
    setFormats([]);
    setRegion("all");
    setPrice("any");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-[#012D1D] text-4xl lg:text-5xl font-bold">
            {t("session.listTitle")}
          </h1>
          <p className="text-[#414844] mt-3 max-w-xl">
            {t("session.listSubtitle")}
          </p>
        </div>

        <div className="flex border border-[#C1C8C2] rounded-md overflow-hidden w-max">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
              view === "list"
                ? "bg-[#012D1D] text-white"
                : "bg-white text-[#414844]"
            }`}
          >
            <LayoutList size={16} />
            {t("session.viewList")}
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
              view === "calendar"
                ? "bg-[#012D1D] text-white"
                : "bg-white text-[#414844]"
            }`}
          >
            <CalendarDays size={16} />
            {t("session.viewCalendar")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mt-8">
        <FilterPanel
          formats={formats}
          toggleFormat={toggleFormat}
          region={region}
          setRegion={setRegion}
          price={price}
          setPrice={setPrice}
          regions={regions}
          onClear={clearAll}
        />

        <div className="flex flex-col gap-6">
          {isLoading && (
            <p className="text-[#414844]">{t("session.loading")}</p>
          )}
          {error && (
            <p className="text-[#93000A]">
              {t("session.loadError", { error })}
            </p>
          )}

          {!isLoading &&
            !error &&
            (view === "list" ? (
              filtered.length ? (
                filtered.map((s) => <SessionRow key={s.id} session={s} />)
              ) : (
                <p className="text-[#414844] border border-dashed border-[#C1C8C2] rounded-xl p-10 text-center">
                  {t("session.noMatches")}
                </p>
              )
            ) : (
              <CalendarView sessions={filtered} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
