import { normalizePhone } from "./format";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("M-Pesa credentials not configured");
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to obtain M-Pesa token");

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  checkoutId: string;
  accountReference?: string;
}) {
  const token = await getAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const shortcode = process.env.MPESA_SHORTCODE || "174379";
  const passkey = process.env.MPESA_PASSKEY || "";
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );

  const callbackUrl =
    process.env.MPESA_CALLBACK_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`;

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(params.amount),
    PartyA: normalizePhone(params.phone),
    PartyB: shortcode,
    PhoneNumber: normalizePhone(params.phone),
    CallBackURL: callbackUrl,
    AccountReference: params.accountReference || params.checkoutId.slice(0, 12),
    TransactionDesc: "Lacianda POS Payment",
  };

  const res = await fetch(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (data.errorCode) {
    throw new Error(data.errorMessage || "STK push failed");
  }
  return {
    merchantRequestId: data.MerchantRequestID as string,
    checkoutRequestId: data.CheckoutRequestID as string,
    responseDescription: data.ResponseDescription as string,
  };
}

export function parseStkWebhook(body: Record<string, unknown>) {
  const stk = body.Body as Record<string, unknown> | undefined;
  const callback = stk?.stkCallback as Record<string, unknown> | undefined;
  if (!callback) return null;

  const resultCode = callback.ResultCode as number;
  const checkoutRequestId = callback.CheckoutRequestID as string;
  const merchantRequestId = callback.MerchantRequestID as string;
  let mpesaReceipt: string | undefined;
  let amount: number | undefined;
  let phone: string | undefined;

  const metadata = callback.CallbackMetadata as
    | { Item?: Array<{ Name: string; Value?: string | number }> }
    | undefined;

  metadata?.Item?.forEach((item) => {
    if (item.Name === "MpesaReceiptNumber") mpesaReceipt = String(item.Value);
    if (item.Name === "Amount") amount = Number(item.Value);
    if (item.Name === "PhoneNumber") phone = String(item.Value);
  });

  return {
    resultCode,
    resultDesc: callback.ResultDesc as string,
    checkoutRequestId,
    merchantRequestId,
    mpesaReceipt,
    amount,
    phone,
  };
}
