const VAT_RATE = 0.16;

export function formatKES(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(num);
}

export function calcTax(subtotal: number, rate = VAT_RATE) {
  return Math.round(subtotal * rate * 100) / 100;
}

export function generateReceiptNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.getTime().toString().slice(-6);
  return `LAC-${date}-${time}`;
}

export function generateCheckoutId() {
  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizePhone(phone: string) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (!p.startsWith("254")) p = "254" + p;
  return p;
}

export const PAYMENT_METHODS = [
  { id: "stk_push", label: "M-Pesa STK Push", icon: "📱" },
  { id: "paybill", label: "Paybill / Till", icon: "🏪" },
  { id: "pochi", label: "Pochi la Biashara", icon: "💼" },
  { id: "send_money", label: "Send Money", icon: "💸" },
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];
