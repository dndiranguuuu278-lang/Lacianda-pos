"use client";

export type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type ReceiptData = {
  storeName: string;
  receiptNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  mpesaCode?: string;
  etimsCuin?: string;
  etimsQrUrl?: string;
  date: string;
};

const ESC = 0x1b;
const GS = 0x1d;

function encodeText(text: string) {
  return new TextEncoder().encode(text);
}

function buildReceiptCommands(data: ReceiptData, width: 58 | 80 = 80) {
  const chunks: Uint8Array[] = [];
  const push = (bytes: number[]) => chunks.push(new Uint8Array(bytes));
  const line = (text: string) => {
    chunks.push(encodeText(text + "\n"));
  };

  push([ESC, 0x40]); // init
  push([ESC, 0x61, 0x01]); // center
  line(data.storeName.toUpperCase());
  push([ESC, 0x61, 0x00]); // left
  line(`Receipt: ${data.receiptNumber}`);
  line(`Date: ${data.date}`);
  line("-".repeat(width === 58 ? 32 : 42));

  data.items.forEach((item) => {
    line(`${item.name}`);
    line(`  ${item.quantity} x ${item.unitPrice.toFixed(2)} = ${item.lineTotal.toFixed(2)}`);
  });

  line("-".repeat(width === 58 ? 32 : 42));
  line(`Subtotal: KES ${data.subtotal.toFixed(2)}`);
  line(`VAT (16%): KES ${data.tax.toFixed(2)}`);
  line(`TOTAL: KES ${data.total.toFixed(2)}`);
  line(`Payment: ${data.paymentMethod}`);
  if (data.mpesaCode) line(`M-Pesa: ${data.mpesaCode}`);
  if (data.etimsCuin) line(`eTIMS CUIN: ${data.etimsCuin}`);
  if (data.etimsQrUrl) line(`Verify: ${data.etimsQrUrl}`);
  line("");
  push([ESC, 0x61, 0x01]);
  line("Thank you!");
  line("");
  push([GS, 0x56, 0x00]); // cut

  const totalLength = chunks.reduce((s, c) => s + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((c) => {
    merged.set(c, offset);
    offset += c.length;
  });
  return merged;
}

export async function printReceiptBluetooth(
  data: ReceiptData,
  width: 58 | 80 = 80
) {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth is not supported in this browser");
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
    optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
  });

  const server = await device.gatt?.connect();
  if (!server) throw new Error("Could not connect to printer");

  const service = await server.getPrimaryService(
    "000018f0-0000-1000-8000-00805f9b34fb"
  );
  const characteristic = await service.getCharacteristic(
    "00002af1-0000-1000-8000-00805f9b34fb"
  );

  const payload = buildReceiptCommands(data, width);
  const chunkSize = 512;
  for (let i = 0; i < payload.length; i += chunkSize) {
    await characteristic.writeValue(payload.slice(i, i + chunkSize));
  }

  server.disconnect();
  return true;
}

export { buildReceiptCommands };
