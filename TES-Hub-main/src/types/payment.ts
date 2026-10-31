export default interface Payment {
  id: string;
  userId: string;
  itemType: "course" | "article" | "session" | "subscription";
  itemId: string;
  amount: number;
  currency: string;
  method: "click" | "payme" | "card";
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  invoiceUrl?: string;
}
