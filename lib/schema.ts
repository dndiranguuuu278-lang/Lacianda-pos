import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: varchar("google_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  pinHash: varchar("pin_hash", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("cashier"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  deviceInfo: varchar("device_info", { length: 500 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 255 }).notNull().default("General"),
  buyingPrice: decimal("buying_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  stockQty: integer("stock_qty").notNull().default(0),
  barcode: varchar("barcode", { length: 255 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  mpesaCode: varchar("mpesa_code", { length: 100 }),
  etimsCuin: varchar("etims_cusin", { length: 255 }),
  etimsQrUrl: text("etims_qr_url"),
  cashierId: uuid("cashier_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const storeSettings = pgTable("store_settings", {
  id: integer("id").primaryKey().default(1),
  storeName: varchar("store_name", { length: 255 })
    .notNull()
    .default("Lacianda POS"),
  themeMode: varchar("theme_mode", { length: 20 }).notNull().default("dark"),
  accentColour: varchar("accent_colour", { length: 20 })
    .notNull()
    .default("#6366f1"),
  kraPin: varchar("kra_pin", { length: 50 }),
  logoUrl: text("logo_url"),
  currency: varchar("currency", { length: 10 }).notNull().default("KES"),
});

export const paymentRequests = pgTable("payment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkoutId: varchar("checkout_id", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  mpesaReceipt: varchar("mpesa_receipt", { length: 100 }),
  merchantRequestId: varchar("merchant_request_id", { length: 100 }),
  checkoutRequestId: varchar("checkout_request_id", { length: 100 }),
  resultCode: integer("result_code"),
  resultDesc: text("result_desc"),
  saleId: uuid("sale_id").references(() => sales.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type StoreSettings = typeof storeSettings.$inferSelect;
