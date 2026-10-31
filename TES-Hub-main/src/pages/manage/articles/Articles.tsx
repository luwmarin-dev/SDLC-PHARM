import useArticles from "@/lib/hooks/useArticles";
import type Article from "@/types/article";
import status, { type EntityStatus } from "@/types/status";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/lib/hooks/useUser";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Eye, ThumbsUp, Archive, Check, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/api/apiClient";
import moment from "moment";

const PAGE_SIZE = 8;

interface SearchProps {
  search: string;
  onSearch: (e: string) => void;
}

const SearchBar = ({ search, onSearch }: SearchProps) => {
  const { t } = useTranslation();

  return (
    <div className="border-2 p-4 py-3 h-15 bg-white text-[#191C1B] rounded-sm flex items-center gap-2 w-max placeholder:text-[#6B7280]">
      <Search />
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        type="text"
        className="outline-none"
        placeholder={t("manage.articles.searchPlaceholder")}
      />
    </div>
  );
};

interface StatusProps {
  onSelect: (e: EntityStatus | "all") => void;
}

const StatusSelect = ({ onSelect }: StatusProps) => {
  const { t } = useTranslation();

  return (
    <select
      onChange={(e) => onSelect(e.target.value as EntityStatus | "all")}
      className="p-4 py-3 h-15 outline-none border-2 bg-white text-[#191C1B] rounded-sm"
    >
      <option value="all">{t("manage.articles.allStatus")}</option>

      {status.map((s) => (
        <option key={s} value={s}>
          {t(`status.${s}`)}
        </option>
      ))}
    </select>
  );
};

const STATUS_STYLES: Record<
  EntityStatus,
  { bg: string; text: string; dot: string; labelKey: string }
> = {
  published: {
    bg: "bg-[#DCFCE7]",
    text: "text-[#15803D]",
    dot: "bg-[#22C55E]",
    labelKey: "status.published",
  },
  draft: {
    bg: "bg-[#F3F4F6]",
    text: "text-[#4B5563]",
    dot: "bg-[#9CA3AF]",
    labelKey: "status.draft",
  },
  archived: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#DC2626]",
    dot: "bg-[#EF4444]",
    labelKey: "status.archived",
  },
  pending_review: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#B45309]",
    dot: "bg-[#F59E0B]",
    labelKey: "status.pending_review",
  },
  rejected: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#B91C1C]",
    dot: "bg-[#DC2626]",
    labelKey: "status.rejected",
  },
};

const StatusBadge = ({ status }: { status: EntityStatus }) => {
  const { t } = useTranslation();
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {t(s.labelKey)}
    </span>
  );
};

interface TableProps {
  article: Article;
  canModerate: boolean;
  onAction: (slug: string, id: string, next: EntityStatus) => void;
}

function formatNumbers(n: number) {
  if (n >= 1000) {
    return n / 1000 + "k";
  }
  return n;
}

interface ActionDef {
  icon: typeof Eye;
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
  icon: typeof Eye;
  label: string;
  className: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${className}`}
  >
    <Icon size={18} />
  </button>
);

const TableRow = ({
  article: { id, title, createdAt, status, stats, slug, authorId },
  canModerate,
  onAction,
}: TableProps) => {
  const { t } = useTranslation();
  const { user } = useUser(authorId);
  const navigate = useNavigate();

  const actions = canModerate ? (WORKFLOW[status] ?? []) : [];

  return (
    <tr className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
      <td className="px-6 py-5 align-top max-w-xs">
        <span
          onClick={() => navigate(`/manage/articles/${slug}`)}
          className="text-[#191C1B] text-base font-semibold hover:underline cursor-pointer"
        >
          {title}
        </span>
      </td>
      <td className="px-6 py-5 align-top text-[#414844] text-sm whitespace-nowrap">
        {user?.displayName}
      </td>
      <td className="px-6 py-5 align-top text-[#414844] text-sm whitespace-nowrap">
        {moment(createdAt).format("ll")}
      </td>
      <td className="px-6 py-5 align-top whitespace-nowrap">
        <StatusBadge status={status} />
      </td>
      <td className="px-6 py-5 align-top text-[#414844] text-sm whitespace-nowrap">
        <div className="flex gap-5 items-center">
          <div className="flex gap-1.5 items-center">
            <Eye size={18} className="text-[#6B7280]" />
            {stats.views ? formatNumbers(stats.views) : "--"}
          </div>
          <div className="flex gap-1.5 items-center">
            <ThumbsUp size={18} className="text-[#6B7280]" />
            {stats.likes ? formatNumbers(stats.likes) : "--"}
          </div>
        </div>
      </td>
      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-1">
          <IconButton
            icon={Eye}
            label={t("manage.articles.viewArticle")}
            className="text-[#414844] hover:bg-[#F2F4F2]"
            onClick={() => navigate(`/academy/articles/${slug}`)}
          />
          {actions.map((a) => (
            <IconButton
              key={a.next}
              icon={a.icon}
              label={t(a.labelKey)}
              className={a.className}
              onClick={() => onAction(slug, id, a.next)}
            />
          ))}
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
        disabled={page <= 1}
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
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-md border border-[#E5E7EB] text-sm text-[#414844] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
      >
        {t("manage.pagination.next")}
      </button>
    </div>
  );
};

const Articles = () => {
  const { t } = useTranslation();
  const { articles, error, isLoading } = useArticles();
  const { can } = usePermissions();
  const canModerate = can("moderateContent");

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [overrides, setOverrides] = useState<Record<string, EntityStatus>>({});

  async function handleAction(slug: string, id: string, next: EntityStatus) {
    const prev = overrides[id];
    setOverrides((o) => ({ ...o, [id]: next }));
    try {
      await axiosInstance.patch(`/articles/${slug}/status`, { status: next });
    } catch {
      setOverrides((o) => {
        const copy = { ...o };
        if (prev === undefined) delete copy[id];
        else copy[id] = prev;
        return copy;
      });
    }
  }

  const filtered = useMemo(() => {
    return (articles ?? [])
      .map((a) => ({ ...a, status: overrides[a.id] ?? a.status }))
      .filter((a) => {
        const matchesSearch = a.title
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [articles, search, statusFilter, overrides]);

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
    <div>
      <div className="container mx-auto px-10 py-10">
        <header>
          <h1 className="text-[#012D1D] text-5xl font-bold">
            {t("manage.articles.title")}
          </h1>
          <div className="flex items-start justify-between">
            <p className="text-[#414844] text-lg mt-2">
              {t("manage.articles.subtitle")}
            </p>

            <div className="flex gap-2 items-center">
              <SearchBar search={search} onSearch={resetPage(setSearch)} />
              <StatusSelect onSelect={resetPage(setStatusFilter)} />
            </div>
          </div>
        </header>

        <div className="mt-8 border border-[#C1C8C2] rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr className="text-left text-xs font-semibold tracking-wider text-[#6B7280]">
                <th className="px-6 py-4">{t("manage.articles.colTitle")}</th>
                <th className="px-6 py-4">{t("manage.articles.colAuthor")}</th>
                <th className="px-6 py-4">{t("manage.articles.colCreated")}</th>
                <th className="px-6 py-4">{t("manage.articles.colStatus")}</th>
                <th className="px-6 py-4">
                  {t("manage.articles.colPerformance")}
                </th>
                <th className="px-6 py-4">{t("manage.articles.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || error || pageItems.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-[#414844]"
                  >
                    {isLoading
                      ? t("manage.articles.loading")
                      : error
                        ? t("manage.articles.loadError", { error })
                        : t("manage.articles.noMatches")}
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                pageItems.map((a) => (
                  <TableRow
                    key={a.id}
                    article={a}
                    canModerate={canModerate}
                    onAction={handleAction}
                  />
                ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white">
            <p className="text-sm text-[#414844]">
              {filtered.length === 0
                ? t("manage.articles.noEntries")
                : t("manage.articles.showing", {
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
      </div>
    </div>
  );
};

export default Articles;
