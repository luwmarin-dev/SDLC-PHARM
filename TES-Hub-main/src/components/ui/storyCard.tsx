import { BadgeCheck, Lock, MessageCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type Story from "@/types/story";

interface Props {
  story: Story;
}

const StoryCard = ({ story: s }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <div
      className="rounded-lg border border-[#C1C8C2] cursor-pointer hover:shadow-lg p-5 sm:p-6 flex flex-col gap-4 bg-white transition-all delay-0 duration-200 min-w-0"
      onClick={() => navigate(`/community/stories/${s.slug}`)}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          {s.author.avatar && !avatarFailed ? (
            <img
              src={s.author.avatar}
              alt={s.author.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#7A4A20] text-white flex items-center justify-center font-semibold">
              {s.author.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[#191C1B] font-semibold min-w-0">
              <span className="truncate">{s.author.name}</span>
              {s.author.isVerified && (
                <BadgeCheck size={16} className="text-[#1F6D1A] shrink-0" />
              )}
            </div>
            {s.region?.oblast && (
              <p className="text-[#414844] text-xs truncate">
                {t("ui.oblast", { name: s.region.oblast })}
              </p>
            )}
          </div>
        </div>
        {s.isPremium && (
          <div className="flex items-center gap-1 text-[#B45309] bg-[#FEF3E2] text-xs font-semibold py-1 px-2 rounded-full shrink-0 whitespace-nowrap">
            <Lock size={12} /> {t("ui.premium")}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[#191C1B] text-base break-words">{s.title}</h3>
        <p className="text-[#414844] text-sm mt-1">{s.excerpt}</p>
      </div>

      <div className="flex items-center gap-4 text-[#414844] text-sm">
        <div className="flex items-center gap-1">
          <ThumbsUp size={16} /> {s.stats.likes}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={16} /> {s.stats.comments}
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
