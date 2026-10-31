import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "./button";

const UnlockFull = () => {
  const { t } = useTranslation();

  return (
    <div className="border boder-[#C1C8C2] bg-white rounded-sm flex flex-col items-center py-8 px-30 shadow-lg mt-10">
      <div className="p-6 bg-[#FFDCC3] w-max rounded-xl">
        <Lock color="#3E1E00" />
      </div>
      <h2 className="text-[#191C1B] text-3xl font-semibold mt-6">
        {t("ui.unlockTitle")}
      </h2>
      <p className="text-center mt-4">{t("ui.unlockText")}</p>
      <div className="flex gap-4 mt-2">
        <Button>{t("ui.joinAcademy")}</Button>
        <Button variant="outline">{t("common.signIn")}</Button>
      </div>

      <p className="mt-6 text-[#414844] text-xs">
        {t("ui.subsidizedAccess")}{" "}
        <span className="text-[#1F6D1A] cursor-pointer hover:border-b-2 border-[#1F6D1A]">
          {t("ui.learnMore")}
        </span>
      </p>
    </div>
  );
};

export default UnlockFull;
