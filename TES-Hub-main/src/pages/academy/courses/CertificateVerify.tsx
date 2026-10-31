import moment from "moment";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import { verifyCertificate } from "@/lib/service/learningApi";
import type Certificate from "@/types/certificate";
import { LearnLoading } from "./components/LearnStates";

const CertificateVerify = () => {
  const { code = "" } = useParams();
  const { t, i18n } = useTranslation();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    verifyCertificate(code)
      .then((data) => active && setCertificate(data))
      .catch(() => active && setCertificate(null))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [code]);

  if (isLoading) return <LearnLoading />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-[#C1C8C2] bg-white p-8 sm:p-10 text-center">
        <h1 className="text-sm font-semibold uppercase tracking-wider text-[#5C6660]">
          {t("certificate.verifyTitle")}
        </h1>

        {certificate ? (
          <>
            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#EEFBEA]">
              <ShieldCheck className="text-[#1F6D1A]" size={30} />
            </div>
            <p className="mt-5 text-xl font-semibold text-[#1F6D1A]">
              {t("certificate.verified")}
            </p>

            <dl className="mt-8 flex flex-col gap-4 text-left">
              <div className="rounded-lg bg-[#F4F7F4] px-5 py-4">
                <dt className="text-xs uppercase tracking-wider text-[#5C6660]">
                  {t("certificate.issuedTo")}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-[#191C1B]">
                  {certificate.recipientName}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F4F7F4] px-5 py-4">
                <dt className="text-xs uppercase tracking-wider text-[#5C6660]">
                  {t("certificate.forCompleting")}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-[#191C1B]">
                  {certificate.courseTitle}
                </dd>
              </div>
              <div className="rounded-lg bg-[#F4F7F4] px-5 py-4">
                <dt className="text-xs uppercase tracking-wider text-[#5C6660]">
                  {t("certificate.verificationCode")}
                </dt>
                <dd className="mt-1 font-mono tracking-widest text-[#012D1D]">
                  {certificate.verificationCode}
                </dd>
                <p className="mt-2 text-xs text-[#5C6660]">
                  {t("certificate.issuedOn", {
                    date: moment(certificate.issuedAt)
                      .locale(i18n.language)
                      .format("LL"),
                  })}
                </p>
              </div>
            </dl>

            <Link
              to={`/academy/courses/${certificate.courseSlug}`}
              className="mt-8 inline-block"
            >
              <Button className="rounded-lg!">{t("course.goToCourse")}</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#FEE2E2]">
              <ShieldAlert className="text-[#B01919]" size={30} />
            </div>
            <p className="mt-5 text-xl font-semibold text-[#B01919]">
              {t("certificate.invalid")}
            </p>
            <p className="mt-2 font-mono text-sm text-[#5C6660]">{code}</p>
            <Link to="/academy/courses" className="mt-8 inline-block">
              <Button variant="outline" className="rounded-lg!">
                {t("footer.courses")}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateVerify;
