/*
  # Add tax rate to business info

  1. Changes
    - Add tax_rate column to business_info table
    - Set default tax rate to 10%

  2. Notes
    - Tax rate is stored as a percentage (e.g., 10 for 10%)
    - Default value ensures backward compatibility
*/

ALTER TABLE business_info
ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2) DEFAULT 10;