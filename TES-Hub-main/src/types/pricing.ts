export default interface Pricing {
  model: "free" | "one_time" | "subscription_only";
  amount?: number;
  currency: "KGS" | "USD" | "RUB";
  hasDiscount: boolean;
  discountPercent?: number;
  isRefundable: boolean;
  refundDays?: number;
}
