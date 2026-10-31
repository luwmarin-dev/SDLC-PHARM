import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import LegalLayout from "../legal/LegalLayout";
import {
  Callout,
  List,
  Paragraph,
  Section,
  SubHeading,
} from "../legal/LegalSection";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t("privacy.title")}
      description={t("privacy.description")}
      lastUpdated={t("privacy.lastUpdated")}
      next={{ label: t("legal.nav.terms"), to: "/terms-of-service" }}
    >
      <Section index={1} title={t("privacy.s1.title")}>
        <Paragraph>{t("privacy.s1.p1")}</Paragraph>
        <List
          items={t("privacy.s1.items", { returnObjects: true }) as string[]}
        />
      </Section>

      <Section index={2} title={t("privacy.s2.title")}>
        <Paragraph>{t("privacy.s2.p1")}</Paragraph>
        <List
          items={t("privacy.s2.items", { returnObjects: true }) as string[]}
        />
      </Section>

      <Section index={3} title={t("privacy.s3.title")}>
        <Callout icon={Lock} title={t("privacy.s3.calloutTitle")}>
          {t("privacy.s3.callout")}
        </Callout>
        <Paragraph>{t("privacy.s3.p1")}</Paragraph>
      </Section>

      <Section index={4} title={t("privacy.s4.title")}>
        <Paragraph>{t("privacy.s4.p1")}</Paragraph>
      </Section>

      <Section index={5} title={t("privacy.s5.title")}>
        <Paragraph>{t("privacy.s5.p1")}</Paragraph>
        <Paragraph>{t("privacy.s5.p2")}</Paragraph>
      </Section>

      <Section index={6} title={t("privacy.s6.title")}>
        <Paragraph>{t("privacy.s6.p1")}</Paragraph>
        <SubHeading>{t("privacy.s6.subHeading")}</SubHeading>
        <Paragraph>{t("privacy.s6.p2")}</Paragraph>
      </Section>

      <Section index={7} title={t("privacy.s7.title")}>
        <Paragraph>{t("privacy.s7.p1")}</Paragraph>
      </Section>

      <Section index={8} title={t("privacy.s8.title")}>
        <Paragraph>{t("privacy.s8.p1")}</Paragraph>
      </Section>
    </LegalLayout>
  );
};

export default Privacy;
