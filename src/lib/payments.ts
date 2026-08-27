function isValidRazorpayKeyId(key: string | undefined) {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.startsWith("rzp_") && trimmed.length > 12 && !trimmed.includes("...");
}

export function isRazorpayConfigured() {
  return (
    isValidRazorpayKeyId(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET?.trim()) &&
    isValidRazorpayKeyId(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
  );
}

export const INDIA_PAYMENT_METHODS = [
  { id: "razorpay" as const, label: "Pay online", detail: "UPI, cards, netbanking & wallets" },
  { id: "cod" as const, label: "Cash on delivery", detail: "Pay when your order arrives" },
];

export type CheckoutPaymentMethod = (typeof INDIA_PAYMENT_METHODS)[number]["id"];
