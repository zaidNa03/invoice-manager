/*
  # Initial Schema Setup for Invoice Management System

  1. New Tables
    - `business_info`
      - Company details and settings
    - `products`
      - Product catalog with multi-currency support
    - `invoices`
      - Invoice header information
    - `invoice_items`
      - Line items for each invoice
    - `currencies`
      - Supported currencies

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  code text PRIMARY KEY,
  symbol text NOT NULL,
  name text NOT NULL
);

-- Insert default currencies
INSERT INTO currencies (code, symbol, name) VALUES
  ('USD', '$', 'US Dollar'),
  ('EUR', '€', 'Euro'),
  ('SYP', 'S£', 'Syrian Pound')
ON CONFLICT (code) DO NOTHING;

-- Create business_info table
CREATE TABLE IF NOT EXISTS business_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  business_name text NOT NULL,
  address text,
  tax_number text,
  phone text,
  email text,
  logo_url text,
  default_currency text REFERENCES currencies(code) DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(15,2) NOT NULL,
  currency_code text REFERENCES currencies(code) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  invoice_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  notes text,
  subtotal numeric(15,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(15,2) DEFAULT 0,
  total numeric(15,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL,
  currency_code text REFERENCES currencies(code) NOT NULL,
  subtotal numeric(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Business Info Policies
CREATE POLICY "Users can view own business info"
  ON business_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own business info"
  ON business_info
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Products Policies
CREATE POLICY "Users can view own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoices Policies
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoice Items Policies
CREATE POLICY "Users can view own invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own invoice items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_business_info_user_id ON business_info(user_id);