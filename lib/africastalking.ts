export async function sendPaymentConfirmationSms(params: {
  phone: string;
  amount: number;
  receiptNumber: string;
  mpesaCode?: string;
}) {
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const username = process.env.AFRICAS_TALKING_USERNAME;

  if (!apiKey || !username) {
    console.log("[Africa's Talking] SMS skipped — credentials not configured");
    return { status: "skipped" };
  }

  const message = `Thank you for your purchase at Lacianda POS. Amount: KES ${params.amount.toFixed(2)}. Receipt: ${params.receiptNumber}${params.mpesaCode ? `. M-Pesa: ${params.mpesaCode}` : ""}.`;

  const body = new URLSearchParams({
    username,
    to: params.phone,
    message,
  });

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const data = await res.json();
  return data;
}

export async function sendPaymentConfirmationWhatsApp(params: {
  phone: string;
  amount: number;
  receiptNumber: string;
  mpesaCode?: string;
}) {
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const username = process.env.AFRICAS_TALKING_USERNAME;

  if (!apiKey || !username) {
    console.log("[Africa's Talking] WhatsApp skipped — credentials not configured");
    return { status: "skipped" };
  }

  const message = `✅ Payment confirmed at Lacianda POS\nAmount: KES ${params.amount.toFixed(2)}\nReceipt: ${params.receiptNumber}${params.mpesaCode ? `\nM-Pesa Ref: ${params.mpesaCode}` : ""}`;

  const body = new URLSearchParams({
    username,
    to: params.phone,
    message,
    channel: "WhatsApp",
  });

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  return res.json();
}

export async function notifyCustomer(params: {
  phone: string;
  amount: number;
  receiptNumber: string;
  mpesaCode?: string;
  channels?: ("sms" | "whatsapp")[];
}) {
  const channels = params.channels || ["sms"];
  const results: Record<string, unknown> = {};

  if (channels.includes("sms")) {
    results.sms = await sendPaymentConfirmationSms(params);
  }
  if (channels.includes("whatsapp")) {
    results.whatsapp = await sendPaymentConfirmationWhatsApp(params);
  }
  return results;
}
