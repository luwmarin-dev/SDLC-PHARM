import { GraduationCap, MessageCircle, Tv } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-10 lg:px-10 lg:py-15">
      <div
        className="flex flex-col gap-5 border border-[#C1C8C2] rounded-lg p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all delay-0 duration-200"
        onClick={() => navigate("/academy")}
      >
        <div className="p-4 w-min bg-[#1b43321a] rounded-xl">
          <GraduationCap color="#012D1D" size={30} />
        </div>
        <h3 className="text-[#191C1B]">{t("home.services.academyTitle")}</h3>
        <p className="text-[#414844]">{t("home.services.academyText")}</p>
      </div>
      <div
        className="flex flex-col gap-5 border border-[#C1C8C2] rounded-lg p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all delay-0 duration-200"
        onClick={() => navigate("/community")}
      >
        <div className="p-4 w-min bg-[#a5f7924d] rounded-xl">
          <MessageCircle color="#1F6D1A" size={30} />
        </div>
        <h3 className="text-[#191C1B]">{t("home.services.communityTitle")}</h3>
        <p className="text-[#414844]">{t("home.services.communityText")}</p>
      </div>
      <div
        className="flex flex-col gap-5 border border-[#C1C8C2] rounded-lg p-6 sm:p-8 cursor-pointer hover:shadow-lg transition-all delay-0 duration-200"
        onClick={() => navigate("/sessions")}
      >
        <div className="p-4 w-min bg-[#5e31001a] rounded-xl">
          <Tv color="#5E3000" size={30} />
        </div>
        <h3 className="text-[#191C1B]">{t("home.services.sessionsTitle")}</h3>
        <p className="text-[#414844]">{t("home.services.sessionsText")}</p>
      </div>
    </div>
  );
};

export default Services;
