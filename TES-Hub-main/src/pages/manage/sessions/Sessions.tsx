import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmDialog";
import {
  CapacityMeter,
  SessionStatusBadge,
  SessionTypeLabel,
} from "@/components/ui/sessionBadges";
import { usePermissions } from "@/lib/hooks/usePermissions";
import useSessions from "@/lib/hooks/useSessions";
import { useUser } from "@/lib/hooks/useUser";
import {
  cancelSession,
  deleteSession,
  restoreSession,
  setSessionStatus,
} from "@/lib/service/sessionsApi";
import { capacityPercent, getLifecycle, isSameDay } from "@/lib/utils/session";
import type Session from "@/types/session";
import status, { type EntityStatus } from "@/types/status";
import {
  Archive,
  BarChart3,
  CalendarClock,
  CalendarRange,
  Check,
  CirclePlus,
  CircleX,
  Clock,
  ListFilter,
  Pencil,
  RotateCcw,
  Search,
  Send,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  hintIcon: typeof Users;
  hintClass?: string;
  icon: typeof Users;
  iconClass: string;
}

const StatCard = ({
  label,
  value,
  hint,
  hintIcon: HintIcon,
  hintClass = "text-[#15803D]",
  icon: Icon,
  iconClass,
}: StatCardProps) => (
  <div className="flex-1 border border-[#C1C8C2] rounded-xl bg-white p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
          {label}
        </p>
        <h2 className="text-[#012D1D] text-4xl font-bold mt-2">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl ${iconClass}`}>
        <Icon size={22} />
      </div>
    </div>
    <p className={`flex items-center gap-1.5 text-xs mt-4 ${hintClass}`}>
      <HintIcon size={14} />
      {hint}
    </p>
  </div>
);

const StatCards = ({ sessions }: { sessions: Session[] }) => {
  const { t } = useTranslation();
  const stats = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const createdRecently = sessions.filter(
      (s) => new Date(s.createdAt).getTime() >= thirtyDaysAgo,
    ).length;

    const active = sessions.filter((s) => !s.isCanceled);
    const registrations = active.reduce((sum, s) => sum + s.registeredCount, 0);
    const withCapacity = active.filter((s) => s.capacity > 0);
    const capacityAvg = withCapacity.length
      ? Math.round(
          withCapacity.reduce(
            (sum, s) => sum + capacityPercent(s.registeredCount, s.capacity),
            0,
          ) / withCapacity.length,
        )
      : 0;

    const today = active
      .filter((s) => s.status === "published" && isSameDay(s.startsAt))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const next = today.find(
      (s) => new Date(s.startsAt).getTime() >= Date.now(),
    );

    return {
      total: sessions.length,
      createdRecently,
      registrations,
      capacityAvg,
      todayCount: today.length,
      next,
    };
  }, [sessions]);

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8">
      <StatCard
        label={t("manage.sessions.totalSessions")}
        value={String(stats.total)}
        hint={t("manage.sessions.fromLastMonth", {
          count: stats.createdRecently,
        })}
        hintIcon={TrendingUp}
        icon={CalendarRange}
        iconClass="bg-[#DCFCE7] text-[#15803D]"
      />
      <StatCard
        label={t("manage.sessions.activeRegistrations")}
        value={stats.registrations.toLocaleString()}
        hint={t("manage.sessions.capacityAvg", {
          percent: stats.capacityAvg,
        })}
        hintIcon={Users}
        hintClass="text-[#414844]"
        icon={UserPlus}
        iconClass="bg-[#DCFCE7] text-[#15803D]"
      />
      <StatCard
        label={t("manage.sessions.upcomingToday")}
        value={String(stats.todayCount)}
        hint={
          stats.next
            ? t("manage.sessions.nextToday", {
                title: stats.next.title,
                time: moment(stats.next.startsAt).format("h:mmA"),
              })
            : t("manage.sessions.nothingToday")
        }
        hintIcon={Clock}
        hintClass="text-[#B45309]"
        icon={CalendarClock}
        iconClass="bg-[#FEF3C7] text-[#B45309]"
      />
    </div>
  );
};

interface FiltersProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: EntityStatus | "all";
  onStatus: (v: EntityStatus | "all") => void;
  formatFilter: string;
  onFormat: (v: string) => void;
}

const AdvancedFilters = ({
  search,
  onSearch,
  statusFilter,
  onStatus,
  formatFilter,
  onFormat,
}: FiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row gap-3 px-6 pb-5 border-b border-[#E5E7EB]">
      <div className="border border-[#C1C8C2] px-4 h-11 bg-white text-[#191C1B] rounded-md flex items-center gap-2 flex-1">
        <Search size={18} className="text-[#6B7280]" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="text"
          className="outline-none w-full text-sm"
          placeholder={t("manage.sessions.searchPlaceholder")}
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatus(e.target.value as EntityStatus | "all")}
        className="px-4 h-11 outline-none border border-[#C1C8C2] bg-white text-[#191C1B] rounded-md text-sm"
      >
        <option value="all">{t("manage.sessions.allStatus")}</option>
        {status.map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </select>
      <select
        value={formatFilter}
        onChange={(e) => onFormat(e.target.value)}
        className="px-4 h-11 outline-none border border-[#C1C8C2] bg-white text-[#191C1B] rounded-md text-sm"
      >
        <option value="all">{t("manage.sessions.allFormats")}</option>
        <option value="online">{t("session.format.online")}</option>
        <option value="onsite">{t("session.format.onsite")}</option>
        <option value="hybrid">{t("session.format.hybrid")}</option>
      </select>
    </div>
  );
};

interface ActionDef {
  icon: typeof Send;
  labelKey: string;
  next: EntityStatus;
  className: string;
}

const WORKFLOW: Partial<Record<EntityStatus, ActionDef[]>> = {
  draft: [
    {
      icon: Send,
      labelKey: "manage.courses.workflow.submit",
      next: "pending_review",
      className: "text-[#2563EB] hover:bg-[#EFF6FF]",
    },
  ],
  pending_review: [
    {
      icon: Check,
      labelKey: "manage.courses.workflow.approve",
      next: "published",
      className: "text-[#15803D] hover:bg-[#DCFCE7]",
    },
    {
      icon: X,
      labelKey: "manage.courses.workflow.reject",
      next: "rejected",
      className: "text-[#DC2626] hover:bg-[#FEE2E2]",
    },
  ],
  rejected: [
    {
      icon: Send,
      labelKey: "manage.courses.workflow.resubmit",
      next: "pending_review",
      className: "text-[#2563EB] hover:bg-[#EFF6FF]",
    },
  ],
  published: [
    {
      icon: Archive,
      labelKey: "manage.courses.workflow.archive",
      next: "archived",
      className: "text-[#B45309] hover:bg-[#FEF3C7]",
    },
  ],
  archived: [
    {
      icon: Send,
      labelKey: "manage.courses.workflow.restore",
      next: "pending_review",
      className: "text-[#2563EB] hover:bg-[#EFF6FF]",
    },
  ],
};

const IconButton = ({
  icon: Icon,
  label,
  className,
  onClick,
}: {
  icon: typeof Send;
  label: string;
  className: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`p-2 rounded-md transition-colors cursor-pointer ${className}`}
  >
    <Icon size={18} />
  </button>
);

interface RowProps {
  session: Session;
  canModerate: boolean;
  onStatus: (session: Session, next: EntityStatus) => void;
  onCancel: (session: Session) => void;
  onRestore: (session: Session) => void;
  onDelete: (session: Session) => void;
}

const HostCell = ({ hostId }: { hostId: string }) => {
  const { user } = useUser(hostId);

  return (
    <div className="flex items-center gap-2">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.displayName}
          className="h-8 w-8 rounded-full object-cover bg-[#E6E9E7]"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-[#E6E9E7] flex items-center justify-center text-[10px] font-bold text-[#012D1D]">
          {user?.displayName?.[0] ?? "?"}
        </div>
      )}
      <span className="text-[#191C1B] font-medium text-sm">
        {user?.displayName ?? "—"}
      </span>
    </div>
  );
};

const TableRow = ({
  session,
  canModerate,
  onStatus,
  onCancel,
  onRestore,
  onDelete,
}: RowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lifecycle = getLifecycle(session);
  const canceled = Boolean(session.isCanceled);
  const moderation =
    canModerate && !canceled ? (WORKFLOW[session.status] ?? []) : [];

  return (
    <tr className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
      <td className="px-6 py-5 align-top max-w-xs">
        <span
          onClick={() => navigate(`/manage/sessions/${session.slug}`)}
          className={`block text-[#191C1B] text-base font-semibold hover:underline cursor-pointer ${
            canceled ? "line-through text-[#9CA3AF]" : ""
          }`}
        >
          {session.title}
        </span>
        <SessionTypeLabel type={session.sessionType} />
      </td>
      <td className="px-6 py-5 align-top whitespace-nowrap">
        <HostCell hostId={session.hostId} />
      </td>
      <td className="px-6 py-5 align-top text-[#191C1B] text-sm whitespace-nowrap">
        {moment(session.startsAt).format("MMM D, YYYY")}
        <span className="block text-[#414844] text-xs mt-0.5">
          {canceled
            ? t("session.lifecycle.canceled")
            : `${moment(session.startsAt).format("HH:mm")} - ${moment(
                session.endsAt,
              ).format("HH:mm")}`}
        </span>
      </td>
      <td className="px-6 py-5 align-top whitespace-nowrap">
        <SessionStatusBadge session={session} />
      </td>
      <td className="px-6 py-5 align-top">
        <CapacityMeter
          registered={session.registeredCount}
          capacity={session.capacity}
          canceled={canceled}
        />
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-1">
          {canceled ? (
            <>
              <IconButton
                icon={RotateCcw}
                label={t("manage.sessions.restoreSession")}
                className="text-[#2563EB] hover:bg-[#EFF6FF]"
                onClick={() => onRestore(session)}
              />
              <IconButton
                icon={Trash2}
                label={t("manage.sessions.deleteSession")}
                className="text-[#DC2626] hover:bg-[#FEE2E2]"
                onClick={() => onDelete(session)}
              />
            </>
          ) : (
            <>
              <IconButton
                icon={Pencil}
                label={t("manage.sessions.editSession")}
                className="text-[#414844] hover:bg-[#F2F4F2]"
                onClick={() => navigate(`/manage/sessions/${session.slug}`)}
              />
              <IconButton
                icon={BarChart3}
                label={t("manage.sessions.viewPublic")}
                className="text-[#414844] hover:bg-[#F2F4F2]"
                onClick={() => navigate(`/sessions/${session.slug}`)}
              />
              {moderation.map((a) => (
                <IconButton
                  key={a.next}
                  icon={a.icon}
                  label={t(a.labelKey)}
                  className={a.className}
                  onClick={() => onStatus(session, a.next)}
                />
              ))}
              {session.status === "published" && lifecycle !== "completed" ? (
                <IconButton
                  icon={CircleX}
                  label={t("manage.sessions.cancelSession")}
                  className="text-[#DC2626] hover:bg-[#FEE2E2]"
                  onClick={() => onCancel(session)}
                />
              ) : (
                <IconButton
                  icon={Trash2}
                  label={t("manage.sessions.deleteSession")}
                  className="text-[#DC2626] hover:bg-[#FEE2E2]"
                  onClick={() => onDelete(session)}
                />
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

const Pagination = ({ page, totalPages, onPage }: PaginationProps) => {
  const { t } = useTranslation();
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i <= 3 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-md border border-[#E5E7EB] text-sm text-[#414844] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
      >
        {t("manage.pagination.prev")}
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-[#9CA3AF]">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`h-9 w-9 rounded-md text-sm ${
              p === page
                ? "bg-[#012D1D] text-white"
                : "border border-[#E5E7EB] text-[#414844] hover:bg-[#F9FAFB]"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-md border border-[#E5E7EB] text-sm text-[#414844] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
      >
        {t("manage.pagination.next")}
      </button>
    </div>
  );
};

const ManageSessions = () => {
  const { t } = useTranslation();
  const { sessions, isLoading, error } = useSessions();
  const { can } = usePermissions();
  const canModerate = can("moderateContent");
  const canCreate = can("createSession");
  const navigate = useNavigate();

  const [items, setItems] = useState<Session[]>([]);
  useEffect(() => {
    if (sessions) setItems(sessions);
  }, [sessions]);

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | "all">("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{
    kind: "cancel" | "delete";
    session: Session;
  } | null>(null);

  function patchItem(id: string, patch: Partial<Session>) {
    setItems((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleStatus(session: Session, next: EntityStatus) {
    const prev = session.status;
    patchItem(session.id, { status: next });
    try {
      await setSessionStatus(session.slug, next);
    } catch {
      patchItem(session.id, { status: prev });
    }
  }

  async function handleRestore(session: Session) {
    patchItem(session.id, { isCanceled: false });
    try {
      await restoreSession(session.slug);
    } catch {
      patchItem(session.id, { isCanceled: true });
    }
  }

  async function confirmCancel(session: Session) {
    patchItem(session.id, { isCanceled: true });
    try {
      await cancelSession(session.slug);
    } catch {
      patchItem(session.id, { isCanceled: false });
    }
  }

  async function confirmDelete(session: Session) {
    const snapshot = items;
    setItems((list) => list.filter((s) => s.id !== session.id));
    try {
      await deleteSession(session.slug);
    } catch {
      setItems(snapshot);
    }
  }

  async function runPendingAction() {
    if (!pending) return;
    const { kind, session } = pending;
    setPending(null);
    if (kind === "cancel") await confirmCancel(session);
    else await confirmDelete(session);
  }

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const matchesSearch = s.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesFormat = formatFilter === "all" || s.format === formatFilter;
      return matchesSearch && matchesStatus && matchesFormat;
    });
  }, [items, search, statusFilter, formatFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  function resetPage<T>(fn: (v: T) => void) {
    return (v: T) => {
      fn(v);
      setPage(1);
    };
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <nav className="text-sm text-[#6B7280]">
            {t("manage.contentManagement")} <span className="mx-1">/</span>
            <span className="text-[#012D1D] font-semibold">
              {t("manage.sessions.breadcrumb")}
            </span>
          </nav>
          <h1 className="text-[#012D1D] text-4xl lg:text-5xl font-bold mt-2">
            {t("manage.sessions.title")}
          </h1>
        </div>
        {canCreate && (
          <Button
            className="rounded-md! h-12 gap-2"
            onClick={() => navigate("/manage/sessions/new")}
          >
            <CirclePlus size={20} />
            {t("manage.sessions.create")}
          </Button>
        )}
      </header>

      <StatCards sessions={items} />

      <div className="mt-8 border border-[#C1C8C2] rounded-xl overflow-hidden bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <h3 className="text-[#012D1D] text-lg font-semibold">
            {t("manage.sessions.allSessions")}
          </h3>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-sm text-[#414844] hover:text-[#012D1D] cursor-pointer"
          >
            <ListFilter size={16} />
            {t("manage.sessions.advancedFilters")}
          </button>
        </div>

        {showFilters && (
          <AdvancedFilters
            search={search}
            onSearch={resetPage(setSearch)}
            statusFilter={statusFilter}
            onStatus={resetPage(setStatusFilter)}
            formatFilter={formatFilter}
            onFormat={resetPage(setFormatFilter)}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead className="bg-[#F9FAFB] border-y border-[#E5E7EB]">
              <tr className="text-left text-xs font-semibold tracking-wider text-[#6B7280]">
                <th className="px-6 py-4">{t("manage.sessions.colTitle")}</th>
                <th className="px-6 py-4">{t("manage.sessions.colHost")}</th>
                <th className="px-6 py-4">{t("manage.sessions.colDate")}</th>
                <th className="px-6 py-4">{t("manage.sessions.colStatus")}</th>
                <th className="px-6 py-4">
                  {t("manage.sessions.colCapacity")}
                </th>
                <th className="px-6 py-4">{t("manage.sessions.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((s) => (
                <TableRow
                  key={s.id}
                  session={s}
                  canModerate={canModerate}
                  onStatus={handleStatus}
                  onCancel={(session) =>
                    setPending({ kind: "cancel", session })
                  }
                  onRestore={handleRestore}
                  onDelete={(session) =>
                    setPending({ kind: "delete", session })
                  }
                />
              ))}
              {!pageItems.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#6B7280] text-sm"
                  >
                    {isLoading
                      ? t("manage.sessions.loading")
                      : error
                        ? t("manage.sessions.loadError", { error })
                        : t("manage.sessions.noMatches")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E5E7EB] bg-white">
          <p className="text-sm text-[#414844]">
            {filtered.length === 0
              ? t("manage.sessions.noEntries")
              : t("manage.sessions.showing", {
                  from: start + 1,
                  to: Math.min(start + PAGE_SIZE, filtered.length),
                  total: filtered.length,
                })}
          </p>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPage={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={
          pending?.kind === "cancel"
            ? t("manage.sessions.cancelSession")
            : t("manage.sessions.deleteSession")
        }
        message={
          pending?.kind === "cancel"
            ? t("manage.sessions.cancelMessage", {
                title: pending.session.title,
              })
            : t("manage.sessions.deleteMessage", {
                title: pending?.session.title,
              })
        }
        confirmLabel={
          pending?.kind === "cancel"
            ? t("manage.sessions.cancelSession")
            : t("manage.sessions.deleteSession")
        }
        cancelLabel={t("manage.sessions.keepIt")}
        onConfirm={runPendingAction}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default ManageSessions;
