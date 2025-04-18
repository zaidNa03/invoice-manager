/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `gender` (text, optional)
      - `phone` (text, optional)
      - `address` (text, optional)
      - `email` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on customers table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other', NULL)),
  phone text,
  address text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);