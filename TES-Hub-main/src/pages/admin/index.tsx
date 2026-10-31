import {
  Flag as FlagIcon,
  ShieldBan,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import StyledContainer from "../../components/layout/StyledContainer";
import axiosInstance from "../../lib/api/apiClient";
import axios from "axios";
import type Flag from "../../types/flag";
import { ROLES, type Role } from "../../types/role";
import type User from "../../types/user";

interface StatProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
}

const StatCard = ({ label, value, icon: Icon, iconClass }: StatProps) => (
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

const FLAG_STATUS_STYLES: Record<Flag["status"], string> = {
  pending: "bg-[#FFF3CD] text-[#8A6100]",
  dismissed: "bg-[#E7F0EA] text-[#1B4332]",
  actioned: "bg-[#FFDAD6] text-[#93000A]",
};

const Admin = () => {
  const { t } = useTranslation();

  const [flags, setFlags] = useState<Flag[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      axiosInstance.get<Flag[]>("/admin/flags"),
      axiosInstance.get<User[]>("/admin/users"),
    ])
      .then(([flagRes, userRes]) => {
        if (!active) return;
        setFlags(flagRes.data);
        setMembers(userRes.data);
      })
      .catch(() => {
        if (active) setError(t("common.errorGeneric"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const resolveFlag = async (id: string, status: Flag["status"]) => {
    setBusyId(id);
    setError("");
    try {
      const res = await axiosInstance.patch<Flag>(`/admin/flags/${id}`, {
        status,
      });
      setFlags((current) =>
        current.map((flag) => (flag.id === id ? res.data : flag)),
      );
    } catch (err: unknown) {
      setError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("admin.actionFailed"),
      );
    } finally {
      setBusyId(null);
    }
  };

  const updateMember = async (
    id: string,
    patch: { role?: Role; isBanned?: boolean },
  ) => {
    setBusyId(id);
    setError("");
    try {
      const res = await axiosInstance.patch<User>(`/admin/users/${id}`, patch);
      setMembers((current) =>
        current.map((member) => (member.id === id ? res.data : member)),
      );
    } catch (err: unknown) {
      setError(
        (axios.isAxiosError(err) && err.response?.data?.message) ||
          t("admin.actionFailed"),
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingFlags = flags.filter((flag) => flag.status === "pending");
  const bannedCount = members.filter((member) => member.isBanned).length;

  return (
    <StyledContainer className="py-8 md:py-12">
      <header>
        <h1 className="text-[#012D1D] font-bold text-3xl md:text-5xl">
          {t("admin.title")}
        </h1>
        <p className="text-[#414844] text-base md:text-lg mt-3 max-w-2xl">
          {t("admin.subtitle")}
        </p>
        <div className="h-px w-full bg-[#C1C8C2] mt-8" />
      </header>

      {error && (
        <p role="alert" className="text-[#BA1A1A] text-sm mt-6">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[#414844] mt-10">{t("common.loading")}</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            <StatCard
              label={t("admin.stats.members")}
              value={members.length}
              icon={Users}
              iconClass="bg-[#E7F0EA] text-[#1B4332]"
            />
            <StatCard
              label={t("admin.stats.pendingFlags")}
              value={pendingFlags.length}
              icon={FlagIcon}
              iconClass="bg-[#FFF3CD] text-[#8A6100]"
            />
            <StatCard
              label={t("admin.stats.banned")}
              value={bannedCount}
              icon={ShieldBan}
              iconClass="bg-[#FFDAD6] text-[#93000A]"
            />
          </div>

          <section className="border border-[#C1C8C2] rounded-xl bg-white p-6 md:p-8 mt-8">
            <h2 className="text-[#012D1D] text-xl md:text-2xl font-semibold">
              {t("admin.moderation.title")}
            </h2>
            <p className="text-[#414844] text-sm mt-2">
              {t("admin.moderation.subtitle")}
            </p>

            {flags.length === 0 ? (
              <p className="text-[#6B7280] mt-6">{t("common.noResults")}</p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0] mt-6">
                {flags.map((flag) => (
                  <li
                    key={flag.id}
                    className="py-5 flex flex-col md:flex-row md:items-center gap-4 justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            FLAG_STATUS_STYLES[flag.status]
                          }`}
                        >
                          {t(`admin.flagStatus.${flag.status}`)}
                        </span>
                        <span className="text-[#191C1B] font-medium">
                          {t(`admin.contentType.${flag.contentType}`)}
                        </span>
                        <span className="text-[#6B7280] text-sm">
                          {t(`admin.reason.${flag.reason}`)}
                        </span>
                      </div>
                      <p className="text-[#414844] text-sm mt-2 break-words">
                        {flag.message ?? t("admin.moderation.noMessage")}
                      </p>
                      <p className="text-[#6B7280] text-xs mt-2">
                        {moment(flag.createdAt).format("LL")} · {flag.contentId}
                      </p>
                    </div>

                    {flag.status === "pending" && (
                      <div className="flex gap-3 shrink-0">
                        <button
                          type="button"
                          disabled={busyId === flag.id}
                          onClick={() => resolveFlag(flag.id, "dismissed")}
                          className="px-4 py-2 rounded-lg border border-[#C1C8C2] text-sm font-semibold text-[#191C1B] cursor-pointer hover:bg-[#F9FAFB] disabled:opacity-50"
                        >
                          {t("admin.moderation.dismiss")}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === flag.id}
                          onClick={() => resolveFlag(flag.id, "actioned")}
                          className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {t("admin.moderation.takeAction")}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-[#C1C8C2] rounded-xl bg-white p-6 md:p-8 mt-8 mb-10">
            <h2 className="text-[#012D1D] text-xl md:text-2xl font-semibold">
              {t("admin.members.title")}
            </h2>
            <p className="text-[#414844] text-sm mt-2">
              {t("admin.members.subtitle")}
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="text-[#6B7280] text-xs uppercase tracking-wider">
                    <th className="py-3 pr-4 font-semibold">
                      {t("admin.members.member")}
                    </th>
                    <th className="py-3 pr-4 font-semibold">
                      {t("admin.members.role")}
                    </th>
                    <th className="py-3 pr-4 font-semibold">
                      {t("admin.members.status")}
                    </th>
                    <th className="py-3 font-semibold text-right">
                      {t("admin.members.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="py-4 pr-4">
                        <Link
                          to={`/profile/${member.id}`}
                          className="text-[#012D1D] font-medium hover:underline"
                        >
                          {member.displayName}
                        </Link>
                        <p className="text-[#6B7280] text-sm">
                          @{member.username}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <select
                          value={member.role}
                          disabled={busyId === member.id}
                          onChange={(e) =>
                            updateMember(member.id, {
                              role: e.target.value as Role,
                            })
                          }
                          className="p-2 border border-[#6B7280] rounded-sm bg-white disabled:opacity-50"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`role.${role}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.isBanned
                              ? "bg-[#FFDAD6] text-[#93000A]"
                              : "bg-[#E7F0EA] text-[#1B4332]"
                          }`}
                        >
                          {member.isBanned
                            ? t("admin.members.banned")
                            : t("admin.members.active")}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() =>
                            updateMember(member.id, {
                              isBanned: !member.isBanned,
                            })
                          }
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 ${
                            member.isBanned
                              ? "border border-[#C1C8C2] text-[#191C1B] hover:bg-[#F9FAFB]"
                              : "bg-[#BA1A1A] hover:bg-[#93000A] text-white"
                          }`}
                        >
                          {member.isBanned ? (
                            <ShieldCheck size={16} />
                          ) : (
                            <ShieldBan size={16} />
                          )}
                          {member.isBanned
                            ? t("admin.members.unban")
                            : t("admin.members.ban")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </StyledContainer>
  );
};

export default Admin;
