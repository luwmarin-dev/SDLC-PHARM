import moment from "moment";
import { Award, Copy, Download, Printer, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/ui/button";
import useCertificate from "@/lib/hooks/useCertificate";
import useCourse from "@/lib/service/useCourse";
import { LearnLoading, LearnMessage } from "./components/LearnStates";
import ProgressBar from "./components/ProgressBar";

const CourseCertificate = () => {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const { course } = useCourse(slug);
  const { certificate, notReady, isEnrolled, isLoading, error } =
    useCertificate(slug);
  const [copied, setCopied] = useState(false);

  if (isLoading) return <LearnLoading />;

  if (!isEnrolled) {
    return (
      <LearnMessage
        title={t("certificate.notEnrolled")}
        action={{
          label: t("course.backToCourse"),
          to: `/academy/courses/${slug}`,
        }}
      />
    );
  }

  if (notReady) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-[#C1C8C2] bg-white p-8 sm:p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFDCC3]">
            <Award className="text-[#8A4A00]" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-[#191C1B]">
            {t("certificate.notReadyTitle")}
          </h1>
          <p className="mt-3 text-[#414844]">
            {t("certificate.notReadyBody", {
              progress: notReady.progressPercent,
              required: notReady.requiredPercent,
            })}
          </p>
          <ProgressBar percent={notReady.progressPercent} className="mt-6" />
          <Link
            to={`/academy/courses/${slug}/learn`}
            className="mt-8 inline-block"
          >
            <Button className="rounded-lg!">
              {t("certificate.keepLearning")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <LearnMessage
        title={t("common.errorTitle")}
        body={error ?? t("common.errorGeneric")}
        action={{
          label: t("course.backToCourse"),
          to: `/academy/courses/${slug}`,
        }}
      />
    );
  }

  const verifyUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;

  const copyVerifyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            to={`/academy/courses/${slug}/learn`}
            className="text-sm font-semibold text-[#1F6D1A] hover:underline"
          >
            ← {t("lesson.backToOverview")}
          </Link>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-lg! py-2!"
              onClick={() => window.print()}
              Icon={Printer}
              iconStyles="mr-2 w-4"
            >
              {t("certificate.print")}
            </Button>
            {certificate.pdfUrl && (
              <a href={certificate.pdfUrl} download>
                <Button
                  variant="outline"
                  className="rounded-lg! py-2!"
                  Icon={Download}
                  iconStyles="mr-2 w-4"
                >
                  {t("certificate.download")}
                </Button>
              </a>
            )}
            <Button
              className="rounded-lg! py-2!"
              onClick={copyVerifyLink}
              Icon={Copy}
              iconStyles="mr-2 w-4"
            >
              {copied
                ? t("certificate.linkCopied")
                : t("certificate.shareLink")}
            </Button>
          </div>
        </div>

        <article className="relative overflow-hidden rounded-xl border-4 border-[#012D1D] bg-white p-8 sm:p-14 text-center shadow-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#EEFBEA]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#F4F7F4]"
          />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#012D1D]">
              <Award className="text-[#A4F792]" size={30} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#1F6D1A]">
              {t("certificate.academy")}
            </p>
            <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-bold text-[#012D1D]">
              {t("certificate.title")}
            </h1>

            <p className="mt-10 text-sm text-[#414844]">
              {t("certificate.issuedTo")}
            </p>
            <p className="mt-2 border-b border-[#C1C8C2] pb-3 text-3xl sm:text-4xl font-bold text-[#191C1B]">
              {certificate.recipientName}
            </p>

            <p className="mt-6 text-sm text-[#414844]">
              {t("certificate.forCompleting")}
            </p>
            <p className="mt-2 text-xl sm:text-2xl font-semibold text-[#012D1D]">
              {certificate.courseTitle}
            </p>

            {certificate.scorePercent !== undefined && (
              <p className="mt-4 inline-block rounded-md bg-[#EEFBEA] px-4 py-1.5 text-sm font-semibold text-[#1F6D1A]">
                {t("certificate.score", { percent: certificate.scorePercent })}
              </p>
            )}

            <div className="mt-12 flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
              <div className="text-left">
                <p className="text-xs text-[#5C6660]">
                  {t("certificate.issuedOn", {
                    date: moment(certificate.issuedAt)
                      .locale(i18n.language)
                      .format("LL"),
                  })}
                </p>
                <p className="mt-1 text-xs text-[#5C6660]">
                  {t("certificate.credentialId")}: {certificate.id}
                </p>
              </div>

              <div className="text-center">
                <p className="font-heading text-lg italic text-[#012D1D]">
                  TES Knowledge Hub
                </p>
                <div className="mt-1 w-52 border-t border-[#191C1B]" />
                <p className="mt-1 text-xs text-[#5C6660]">
                  {t("certificate.director")}
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-lg bg-[#F4F7F4] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-[#5C6660]">
                {t("certificate.verificationCode")}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-widest text-[#012D1D]">
                {certificate.verificationCode}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#414844]">
                <ShieldCheck size={14} className="text-[#1F6D1A]" />
                {t("certificate.verifyHint")}
              </p>
            </div>
          </div>
        </article>

        {course && (
          <p className="mt-6 text-center text-sm text-[#414844] print:hidden">
            <Link
              to={`/academy/courses/${course.slug}`}
              className="font-semibold text-[#1F6D1A] hover:underline"
            >
              {course.title}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseCertificate;
