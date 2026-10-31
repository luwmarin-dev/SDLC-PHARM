import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import ProfileBadge from "@/components/ui/profileBadge";
import LegalLayout from "../legal/LegalLayout";
import {
  Callout,
  List,
  Paragraph,
  Section,
  SubHeading,
} from "../legal/LegalSection";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t("terms.title")}
      description={t("terms.description")}
      lastUpdated={t("terms.lastUpdated")}
      next={{ label: t("legal.nav.privacy"), to: "/privacy-policy" }}
    >
      <Section index={1} title={t("terms.s1.title")}>
        <Paragraph>{t("terms.s1.p1")}</Paragraph>
      </Section>

      <Section index={2} title={t("terms.s2.title")}>
        <Paragraph>{t("terms.s2.p1")}</Paragraph>
        <List
          items={t("terms.s2.items", { returnObjects: true }) as string[]}
        />
        <Paragraph>{t("terms.s2.p2")}</Paragraph>
      </Section>

      <Section index={3} title={t("terms.s3.title")}>
        <Callout icon={ShieldAlert} title={t("terms.s3.calloutTitle")}>
          {t("terms.s3.callout")}
        </Callout>
        <Paragraph>{t("terms.s3.p1")}</Paragraph>
        <SubHeading>{t("terms.s3.badgesHeading")}</SubHeading>
        <div className="flex flex-wrap items-center gap-2 text-[#414844] text-sm leading-6">
          <span>{t("terms.s3.badgesLead")}</span>
          <ProfileBadge role="verified_farmer" />
          <span>{t("terms.s3.badgesOr")}</span>
          <ProfileBadge role="tes_author" />
          <span>{t("terms.s3.badgesTail")}</span>
        </div>
      </Section>

      <Section index={4} title={t("terms.s4.title")}>
        <Paragraph>{t("terms.s4.p1")}</Paragraph>
      </Section>

      <Section index={5} title={t("terms.s5.title")}>
        <Paragraph>{t("terms.s5.p1")}</Paragraph>
        <Paragraph>{t("terms.s5.p2")}</Paragraph>
      </Section>
    </LegalLayout>
  );
};

export default Terms;
