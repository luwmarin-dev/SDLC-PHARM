import type Certificate from "../../types/certificate";

const certificates: Certificate[] = [
  {
    id: "cert-soil-health-verified-farmer",
    userId: "user-verified-farmer-1",
    courseId: "course-soil-health-fundamentals",
    courseSlug: "soil-health-fundamentals",
    courseTitle: "Soil Health Fundamentals",
    recipientName: "Gulnara Asanova",
    issuedAt: "2026-02-14T10:30:00.000Z",
    verificationCode: "TES-SHF-2026-4XK9QD",
    scorePercent: 88,
  },
];

export const findCertificateByCode = (code: string) =>
  certificates.find(
    (c) => c.verificationCode.toLowerCase() === code.toLowerCase(),
  );

export default certificates;
