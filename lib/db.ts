import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id VARCHAR(255) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      pin_hash VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'cashier',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      device_info VARCHAR(500),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      category VARCHAR(255) NOT NULL DEFAULT 'General',
      buying_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
      stock_qty INT NOT NULL DEFAULT 0,
      barcode VARCHAR(255),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      receipt_number VARCHAR(100) NOT NULL UNIQUE,
      total_amount DECIMAL(12,2) NOT NULL,
      tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      payment_method VARCHAR(50) NOT NULL,
      mpesa_code VARCHAR(100),
      etims_cusin VARCHAR(255),
      etims_qr_url TEXT,
      cashier_id UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sale_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id),
      product_name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      line_total DECIMAL(12,2) NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT PRIMARY KEY DEFAULT 1,
      store_name VARCHAR(255) NOT NULL DEFAULT 'Lacianda POS',
      theme_mode VARCHAR(20) NOT NULL DEFAULT 'dark',
      accent_colour VARCHAR(20) NOT NULL DEFAULT '#6366f1',
      kra_pin VARCHAR(50),
      logo_url TEXT,
      currency VARCHAR(10) NOT NULL DEFAULT 'KES'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payment_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      checkout_id VARCHAR(100) NOT NULL UNIQUE,
      phone_number VARCHAR(20),
      amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      mpesa_receipt VARCHAR(100),
      merchant_request_id VARCHAR(100),
      checkout_request_id VARCHAR(100),
      result_code INT,
      result_desc TEXT,
      sale_id UUID REFERENCES sales(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO store_settings (id, store_name)
    VALUES (1, 'Lacianda POS System')
    ON CONFLICT (id) DO NOTHING
  `;
}
