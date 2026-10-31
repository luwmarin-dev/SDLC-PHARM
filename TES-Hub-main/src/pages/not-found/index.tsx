import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-10 py-20 flex flex-col items-center gap-4 text-center">
      <p className="text-5xl font-bold text-[#012D1D]">404</p>
      <h1 className="text-2xl font-semibold text-[#191C1B]">
        {t("common.notFound")}
      </h1>
      <p className="text-[#414844]">{t("common.notFoundText")}</p>
      <Link
        to="/"
        className="mt-2 py-2 px-4 rounded-sm bg-[#1B4332] text-white text-sm font-semibold hover:brightness-120 transition"
      >
        {t("common.backHome")}
      </Link>
    </div>
  );
};

export default NotFound;
