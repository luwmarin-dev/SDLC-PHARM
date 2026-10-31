import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

const Alert = () => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 border-l-5 p-5 border-[#BA1A1A] bg-[#FFDAD6] rounded-lg w-full">
      <div>
        <TriangleAlert color="#93000A" />
      </div>
      <div>
        <h3 className="text-base text-[#93000A]">
          {t("ui.accountSuspendedTitle")}
        </h3>
        <p className="text-base mt-2 text-[#93000A]">
          {t("ui.accountSuspendedText")}
        </p>
      </div>
    </div>
  );
};

export default Alert;
