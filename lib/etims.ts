export type EtimsInvoicePayload = {
  receiptNumber: string;
  totalAmount: number;
  taxAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  kraPin?: string;
  paymentMethod: string;
  mpesaCode?: string;
};

export type EtimsResponse = {
  cuin: string;
  qrUrl: string;
  fiscalInvoiceNumber: string;
};

export async function submitEtimsInvoice(
  payload: EtimsInvoicePayload
): Promise<EtimsResponse> {
  const baseUrl = process.env.ETIMS_API_URL;
  const apiKey = process.env.ETIMS_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      cuin: `CUIN-DEMO-${Date.now()}`,
      qrUrl: `https://etims.kra.go.ke/verify/demo-${payload.receiptNumber}`,
      fiscalInvoiceNumber: `FINV-${payload.receiptNumber}`,
    };
  }

  const res = await fetch(`${baseUrl}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_number: payload.receiptNumber,
      total: payload.totalAmount,
      tax: payload.taxAmount,
      kra_pin: payload.kraPin,
      payment_method: payload.paymentMethod,
      mpesa_ref: payload.mpesaCode,
      line_items: payload.items.map((i) => ({
        description: i.name,
        qty: i.quantity,
        unit_price: i.unitPrice,
        total: i.lineTotal,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eTIMS submission failed: ${err}`);
  }

  const data = await res.json();
  return {
    cuin: data.cuin || data.CUIN,
    qrUrl: data.qr_url || data.qrUrl,
    fiscalInvoiceNumber: data.fiscal_invoice_number || data.invoiceNumber,
  };
}
