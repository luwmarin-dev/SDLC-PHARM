import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import background_img from "/img/login/section-right-bg.png";

interface Props {
  children: ReactNode;
}

const AuthShell = ({ children }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-[50%] p-6 lg:p-10 bg-[#F8FAF8] flex flex-col">
        <h1
          className="text-[#012D1D] font-bold text-xl lg:text-2xl cursor-pointer w-fit"
          onClick={() => navigate("/")}
        >
          {t("auth.brand")}
        </h1>
        <div className="flex items-center justify-center flex-1 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div
        style={{ backgroundImage: `url('${background_img}')` }}
        className="hidden lg:block h-screen w-[50%] bg-no-repeat bg-top-right bg-cover sticky top-0"
      />
    </div>
  );
};

export default AuthShell;
