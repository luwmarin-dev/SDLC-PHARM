import type Session from "@/types/session";
import { Clock4, MapPin, UsersRound, Video } from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface Props {
  sessions: Session;
}

const SessionCard = ({ sessions: s }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const month = moment(s.startsAt).format("MMM").toUpperCase();
  const day = moment(s.startsAt).format("DD");
  const startsAt = moment(s.startsAt).format("HH:mm");
  const endsAt = moment(s.endsAt).format("HH:mm");

  const percent = (s.registeredCount / s.capacity) * 100;

  const isAlmostFull = percent >= 85;

  return (
    <div
      className="bg-[#F8FAF8] border border-[#C1C8C2] rounded-lg p-5 sm:p-8 cursor-pointer min-w-0 hover:shadow-lg transition-all delay-0 duration-200"
      onClick={() => navigate(`/sessions/${s.slug}`)}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="bg-[#ECEEEC] flex flex-col items-center rounded-xs p-2 w-15 h-15">
          <p className="text-[#414844] font-bold text-xs">{month}</p>
          <p className="text-[#012D1D] font-bold text-xl">{day}</p>
        </div>
        {s.format === "online" ? (
          <div className="text-[#267320] p-1 px-2 text-xs flex items-center gap-1 bg-[#a5f7924d] rounded-xs shrink-0 whitespace-nowrap">
            <Video size={17} /> {t("session.online")}
          </div>
        ) : (
          <div className="text-[#012D1D] p-1 px-2 text-xs flex items-center gap-1 bg-[#1b43321a] rounded-xs shrink-0 whitespace-nowrap">
            <UsersRound size={17} /> {t("session.offline")}
          </div>
        )}
      </header>
      <p className="text-[#191C1B] mt-5 break-words">{s.title}</p>

      <div className="flex items-center gap-2 text-sm text-[#414844] mt-5 min-w-0">
        <Clock4 size={18} className="shrink-0" />
        <div className="flex items-center gap-2">
          <p>{startsAt}</p>
          <p>-</p>
          <p>{endsAt}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#414844] mt-2 min-w-0">
        <MapPin size={18} className="shrink-0" />
        <p>
          {s.region?.oblast} {s.region?.raion && "," + s.region.oblast}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-xs text-[#414844] shrink-0">{t("session.capacity")}</p>
          <p
            className={`text-xs ${isAlmostFull ? "text-[#F48C24]" : "text-[#012D1D]"} font-bold`}
          >
            {t("session.spots", {
              registered: s.registeredCount,
              capacity: s.capacity,
            })}{" "}
            {isAlmostFull && t("session.almostFullSuffix")}
          </p>
        </div>
        <div className="w-full rounded-xl bg-[#ECEEEC] overflow-hidden h-3 mt-2">
          <div
            className={`h-3 rounded-xl ${isAlmostFull ? "bg-[#F48C24]" : "bg-[#012D1D]"}`}
            style={{ width: percent + "%" }}
          ></div>
        </div>
        <button className="w-full bg-[#E6E9E7] text-[#191C1B] p-3 text-base mt-8 cursor-pointer">
          {t("session.registerNow")}
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
