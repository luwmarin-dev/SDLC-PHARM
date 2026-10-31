import { StatusBadge } from "@/components/ui/sessionBadges";
import useArticles from "@/lib/hooks/useArticles";
import useCourses from "@/lib/hooks/useCourses";
import usePermissions from "@/lib/hooks/usePermissions";
import useSessions from "@/lib/hooks/useSessions";
import type { Action } from "@/lib/permissions";
import type BaseContent from "@/types/base-content";
import type { EntityStatus } from "@/types/status";
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  CirclePlus,
  ClipboardCheck,
  FileText,
  Inbox,
  Layers,
  Send,
  type LucideIcon,
} from "lucide-react";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface Area {
  key: "articles" | "courses" | "sessions";
  icon: LucideIcon;
  iconClass: string;
  createAction: Action;
  items: BaseContent[];
  isLoading: boolean;
  error: string | null;
}

const countBy = (items: BaseContent[], status: EntityStatus) =>
  items.filter((i) => i.status === status).length;

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
}

const StatCard = ({ label, value, icon: Icon, iconClass }: StatCardProps) => (
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
  </div>
);

interface AreaCardProps {
  area: Area;
  canCreate: boolean;
}

const AreaCard = ({ area, canCreate }: AreaCardProps) => {
  const { t } = useTranslation();
  const { key, icon: Icon, iconClass, items, isLoading, error } = area;

  const rows: EntityStatus[] = ["published", "pending_review", "draft"];

  return (
    <section className="flex flex-col border border-[#C1C8C2] rounded-xl bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[#012D1D] text-xl font-semibold">
            {t(`manage.dashboard.areas.${key}.title`)}
          </h3>
          <p className="text-[#414844] text-sm mt-1">
            {t(`manage.dashboard.areas.${key}.description`)}
          </p>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {rows.map((status) => (
          <div
            key={status}
            className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] px-3 py-3"
          >
            <p className="text-[#012D1D] text-xl font-bold">
              {isLoading || error ? "—" : countBy(items, status)}
            </p>
            <p className="text-[#6B7280] text-xs mt-0.5">
              {t(`status.${status}`)}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="text-[#93000A] text-xs mt-3">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 mt-auto pt-5">
        <Link
          to={`/manage/${key}`}
          className="flex items-center gap-2 bg-[#012D1D] text-white text-sm font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
        >
          {t("manage.dashboard.manage")}
          <ArrowRight size={16} />
        </Link>
        {canCreate && (
          <Link
            to={`/manage/${key}/new`}
            className="flex items-center gap-2 border border-[#C1C8C2] text-[#191C1B] text-sm font-semibold py-2 px-4 rounded-md hover:bg-[#F9FAFB] transition-colors"
          >
            <CirclePlus size={16} />
            {t("manage.dashboard.createNew")}
          </Link>
        )}
      </div>
    </section>
  );
};

interface ContentRow {
  item: BaseContent;
  area: Area["key"];
}

const ContentList = ({
  rows,
  emptyText,
  showTime,
}: {
  rows: ContentRow[];
  emptyText: string;
  showTime: boolean;
}) => {
  const { t } = useTranslation();

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center text-center gap-2 py-10">
        <Inbox size={28} className="text-[#9CA3AF]" />
        <p className="text-[#6B7280] text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[#E5E7EB]">
      {rows.map(({ item, area }) => (
        <li
          key={`${area}-${item.id}`}
          className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <Link
              to={`/manage/${area}/${item.slug}`}
              className="block text-[#191C1B] text-sm font-semibold truncate hover:underline"
            >
              {item.title}
            </Link>
            <p className="text-[#6B7280] text-xs mt-0.5">
              {t(`manage.dashboard.areas.${area}.singular`)}
              {showTime && ` • ${moment(item.updatedAt).fromNow()}`}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </li>
      ))}
    </ul>
  );
};

const Manage = () => {
  const { t } = useTranslation();
  const { can, role } = usePermissions();

  const articles = useArticles();
  const courses = useCourses();
  const sessions = useSessions();

  const areas: Area[] = useMemo(
    () => [
      {
        key: "articles",
        icon: FileText,
        iconClass: "bg-[#DBEAFE] text-[#1E3A8A]",
        createAction: "createArticle",
        items: articles.articles ?? [],
        isLoading: articles.isLoading,
        error: articles.error,
      },
      {
        key: "courses",
        icon: BookOpen,
        iconClass: "bg-[#DCFCE7] text-[#15803D]",
        createAction: "createCourse",
        items: courses.courses ?? [],
        isLoading: courses.isLoading,
        error: courses.error,
      },
      {
        key: "sessions",
        icon: CalendarRange,
        iconClass: "bg-[#FEF3C7] text-[#B45309]",
        createAction: "createSession",
        items: sessions.sessions ?? [],
        isLoading: sessions.isLoading,
        error: sessions.error,
      },
    ],
    [articles, courses, sessions],
  );

  const everything = useMemo<ContentRow[]>(
    () =>
      areas.flatMap((area) =>
        area.items.map((item) => ({ item, area: area.key })),
      ),
    [areas],
  );

  const reviewQueue = useMemo(
    () =>
      everything
        .filter(({ item }) => item.status === "pending_review")
        .sort((a, b) => a.item.updatedAt.localeCompare(b.item.updatedAt))
        .slice(0, 6),
    [everything],
  );

  const recent = useMemo(
    () =>
      [...everything]
        .sort((a, b) => b.item.updatedAt.localeCompare(a.item.updatedAt))
        .slice(0, 6),
    [everything],
  );

  const totals = useMemo(() => {
    const items = everything.map((r) => r.item);
    return {
      total: items.length,
      pending: countBy(items, "pending_review"),
      published: countBy(items, "published"),
      draft: countBy(items, "draft"),
    };
  }, [everything]);

  const canModerate = can("moderateContent");
  const isLoading = areas.some((a) => a.isLoading);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <nav className="text-sm text-[#6B7280]">
            {t("manage.contentManagement")} <span className="mx-1">/</span>
            <span className="text-[#012D1D] font-semibold">
              {t("manage.dashboard.breadcrumb")}
            </span>
          </nav>
          <h1 className="text-[#012D1D] text-4xl lg:text-5xl font-bold mt-2">
            {t("manage.dashboard.title")}
          </h1>
          <p className="text-[#414844] mt-3 max-w-2xl">
            {t("manage.dashboard.subtitle")}
          </p>
        </div>
        <span className="w-max text-xs font-semibold text-[#267320] bg-[#E7F6E4] py-1.5 px-3 rounded-full">
          {t("manage.dashboard.signedInAs", { role: t(`role.${role}`) })}
        </span>
      </header>

      <div className="flex flex-col sm:flex-row gap-6 mt-8">
        <StatCard
          label={t("manage.dashboard.totalContent")}
          value={totals.total}
          icon={Layers}
          iconClass="bg-[#E6E9E7] text-[#012D1D]"
        />
        <StatCard
          label={t("manage.dashboard.pendingReview")}
          value={totals.pending}
          icon={ClipboardCheck}
          iconClass="bg-[#FEF3C7] text-[#B45309]"
        />
        <StatCard
          label={t("manage.dashboard.published")}
          value={totals.published}
          icon={Send}
          iconClass="bg-[#DCFCE7] text-[#15803D]"
        />
        <StatCard
          label={t("manage.dashboard.drafts")}
          value={totals.draft}
          icon={FileText}
          iconClass="bg-[#F3F4F6] text-[#4B5563]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {areas.map((area) => (
          <AreaCard
            key={area.key}
            area={area}
            canCreate={can(area.createAction)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {canModerate && (
          <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-[#012D1D] text-lg font-semibold">
                <ClipboardCheck size={18} />
                {t("manage.dashboard.reviewQueue")}
              </h3>
              {totals.pending > reviewQueue.length && (
                <span className="text-[#6B7280] text-xs">
                  {t("manage.dashboard.andMore", {
                    count: totals.pending - reviewQueue.length,
                  })}
                </span>
              )}
            </div>
            <p className="text-[#414844] text-sm mt-1">
              {t("manage.dashboard.reviewQueueHint")}
            </p>
            <div className="mt-5">
              <ContentList
                rows={reviewQueue}
                showTime
                emptyText={
                  isLoading
                    ? t("common.loading")
                    : t("manage.dashboard.reviewQueueEmpty")
                }
              />
            </div>
          </section>
        )}

        <section
          className={`border border-[#C1C8C2] rounded-xl bg-white p-6 ${
            canModerate ? "" : "lg:col-span-2"
          }`}
        >
          <h3 className="flex items-center gap-2 text-[#012D1D] text-lg font-semibold">
            <Layers size={18} />
            {t("manage.dashboard.recentActivity")}
          </h3>
          <p className="text-[#414844] text-sm mt-1">
            {t("manage.dashboard.recentActivityHint")}
          </p>
          <div className="mt-5">
            <ContentList
              rows={recent}
              showTime
              emptyText={
                isLoading
                  ? t("common.loading")
                  : t("manage.dashboard.recentActivityEmpty")
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Manage;
