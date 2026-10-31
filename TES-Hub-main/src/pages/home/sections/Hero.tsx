import Button from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import hero from "../../../../public/img/homepage/hero.png";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[26rem] w-full items-center bg-cover bg-center bg-no-repeat py-12 sm:min-h-[30rem] lg:h-120 lg:py-0"
      style={{ backgroundImage: `url("${hero}")` }}
    >
      <div className="container mx-auto flex flex-col gap-5 px-4 sm:gap-7 sm:px-6 lg:px-10">
        <p className="max-w-xl text-base text-[#012D1D]">
          {t("home.hero.eyebrow")}
        </p>
        <p className="max-w-xl text-base text-[#414844]">
          {t("home.hero.description")}
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-5">
          <Button onClick={() => navigate("/auth")}>
            {t("home.hero.signUp")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/academy")}>
            {t("home.hero.browseAcademy")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
