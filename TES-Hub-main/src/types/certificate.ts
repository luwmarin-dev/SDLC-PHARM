export default interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  recipientName: string;
  issuedAt: string;
  verificationCode: string;
  scorePercent?: number;
  pdfUrl?: string;
}
