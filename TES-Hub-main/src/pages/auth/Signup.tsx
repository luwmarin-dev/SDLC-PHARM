import { useTranslation } from "react-i18next";

const Signup = () => {
  const { t } = useTranslation();
  return <div>{t("auth.signUp")}</div>;
};

export default Signup;
