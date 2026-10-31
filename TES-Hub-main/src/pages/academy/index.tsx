import { useTranslation } from "react-i18next";
import ProductList from "./components/ProductList";

const Academy = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <header>
        <h1 className="text-[#012D1D] text-3xl sm:text-4xl lg:text-5xl font-bold">
          {t("academy.title")}
        </h1>
        <p className="text-[#414844] text-base sm:text-lg mt-3">
          {t("academy.subtitle")}
        </p>
      </header>
      <ProductList />
    </div>
  );
};

export default Academy;
