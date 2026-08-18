import Papa from "papaparse";

export type CsvProductRow = {
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQty: number;
  barcode: string;
};

const HEADER_MAP: Record<string, keyof CsvProductRow> = {
  name: "name",
  category: "category",
  buyingprice: "buyingPrice",
  "buying price": "buyingPrice",
  buying_price: "buyingPrice",
  sellingprice: "sellingPrice",
  "selling price": "sellingPrice",
  selling_price: "sellingPrice",
  stockquantity: "stockQty",
  stockqty: "stockQty",
  "stock quantity": "stockQty",
  stock_qty: "stockQty",
  stock: "stockQty",
  barcode: "barcode",
};

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/_/g, " ");
}

export function parseProductsCsv(csvText: string): CsvProductRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data
    .map((row) => {
      const mapped: Partial<CsvProductRow> = {};
      for (const [key, value] of Object.entries(row)) {
        const field = HEADER_MAP[normalizeHeader(key)];
        if (!field) continue;
        if (field === "name" || field === "category" || field === "barcode") {
          mapped[field] = String(value || "").trim();
        } else {
          mapped[field] = parseFloat(String(value || "0")) || 0;
        }
      }
      if (!mapped.name) return null;
      return {
        name: mapped.name!,
        category: mapped.category || "General",
        buyingPrice: mapped.buyingPrice ?? 0,
        sellingPrice: mapped.sellingPrice ?? 0,
        stockQty: Math.round(mapped.stockQty ?? 0),
        barcode: mapped.barcode || "",
      };
    })
    .filter(Boolean) as CsvProductRow[];
}
