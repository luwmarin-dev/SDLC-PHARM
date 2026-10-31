import { UserRound, Leaf, BadgeCheck, BookA, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  role?: string;
  className?: string;
}

const ProfileBadge = ({ role, className }: Props) => {
  const { t } = useTranslation();
  const baseClasses =
    "flex gap-2 p-1 px-2 rounded-xl font-semibold text-sm justify-center items-center " +
    className;
  return (
    <div>
      {role === "member" ? (
        <div className={`bg-[#E0F2F1] text-[#00695C] ${baseClasses}`}>
          <UserRound width={20} color="#00695C" /> {t("role.member")}
        </div>
      ) : role === "spac_consultant" ? (
        <div className={` bg-[#DBEAFE] text-[#1E3A8A] ${baseClasses}`}>
          <BadgeCheck width={20} color="#1E3A8A" /> {t("role.spac_consultant")}
        </div>
      ) : role === "tes_admin" ? (
        <div className={`bg-[#1B4332] text-[#FFFFFF] ${baseClasses}`}>
          <Shield width={20} color="#FFFFFF" /> {t("role.tes_admin")}
        </div>
      ) : role === "tes_author" ? (
        <div className={`bg-[#FFF9C4] text-[#F57F17] ${baseClasses}`}>
          <BookA width={20} color="#F57F17" /> {t("role.tes_author")}
        </div>
      ) : role === "verified_farmer" ? (
        <div className={`bg-[#A4F792] text-[#267320] ${baseClasses}`}>
          <Leaf width={20} color="#267320" /> {t("role.verified_farmer")}
        </div>
      ) : (
        <div
          className={`outline-2 outline-[#D8DAD9] text-[#D8DAD9] ${baseClasses}`}
        >
          <UserRound width={20} color="#D8DAD9" /> {t("role.guest")}
        </div>
      )}
    </div>
  );
};

export default ProfileBadge;
