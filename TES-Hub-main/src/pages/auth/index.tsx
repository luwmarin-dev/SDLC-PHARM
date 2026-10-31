import { LogIn, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/button";
import background_img from "/img/login/section-right-bg.png";

import LoginForm from "./components/login-form";
import SignupForm from "./components/signup-form";

const Auth = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("login");

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-[50%] p-6 lg:p-10 bg-[#F8FAF8]">
        <h1 className="text-[#012D1D] font-bold text-xl lg:text-2xl">
          {t("auth.brand")}
        </h1>
        <div className="flex items-center justify-center h-full py-8">
          <div className="w-full max-w-md">
            <h2 className="text-[#012D1D] font-bold text-3xl lg:text-5xl">
              {t("auth.welcomeBack")}
            </h2>
            <p className="text-[#414844] font-size text-lg mt-3">
              {t("auth.welcomeText")}
            </p>

            <div>
              <div className="text-[#012D1D] font-semibold w-full flex justify-between items-center mt-10 border-b">
                <span
                  className={`border-b-3 border-[#012D1D] ${tab == "login" ? " border-[#012D1D]" : "border-transparent text-[#717973]"} p-2 w-[50%] text-center cursor-pointer`}
                  onClick={() => setTab("login")}
                >
                  {t("auth.logIn")}
                </span>
                <span
                  className={`border-b-3 border-[#012D1D] ${tab == "signup" ? " border-[#012D1D]" : "border-transparent text-[#717973]"} p-2 w-[50%] text-center cursor-pointer`}
                  onClick={() => setTab("signup")}
                >
                  {t("auth.signUp")}
                </span>
              </div>

              {tab == "login" && <LoginForm />}

              {tab === "signup" && <SignupForm />}

              <div className="flex w-full justify-center items-center gap-3 my-7">
                <span className="w-[35%] h-0.5 bg-[#C1C8C2]"></span>
                <span className="text-[#414844] text-xs">
                  {t("auth.orContinueWith")}
                </span>
                <span className="w-[35%] h-0.5 bg-[#C1C8C2]"></span>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  Icon={LogIn}
                  iconStyles=""
                  className="w-[45%] gap-1"
                >
                  {t("auth.google")}
                </Button>
                <Button
                  variant="outline"
                  Icon={SendHorizonal}
                  iconStyles="text-[#229ED9]"
                  className="w-[45%] gap-1"
                >
                  {t("auth.telegram")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundImage: `url('${background_img}')`,
        }}
        className="hidden lg:block h-screen w-[50%] bg-no-repeat bg-top-right bg-cover sticky top-0"
      ></div>
    </div>
  );
};

export default Auth;
