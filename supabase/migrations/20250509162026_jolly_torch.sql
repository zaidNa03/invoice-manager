/*
  # Add template settings table

  1. New Tables
    - `template_settings`
      - Store invoice template preferences
      - Color theme settings
      - Layout options
      - Font settings
      - Logo placement

  2. Security
    - Enable RLS if not already enabled
    - Add policies if they don't exist
*/

DO $$ BEGIN
  -- Create table if it doesn't exist
  CREATE TABLE IF NOT EXISTS template_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    primary_color text NOT NULL DEFAULT '#007AFF',
    secondary_color text NOT NULL DEFAULT '#f8f9fa',
    accent_color text NOT NULL DEFAULT '#34C759',
    font_family text NOT NULL DEFAULT 'Inter-Regular',
    layout text NOT NULL DEFAULT 'standard' CHECK (layout IN ('compact', 'standard', 'detailed')),
    logo_position text NOT NULL DEFAULT 'right' CHECK (logo_position IN ('left', 'right', 'center')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE IF EXISTS template_settings ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'template_settings' 
    AND policyname = 'Users can view own template settings'
  ) THEN
    CREATE POLICY "Users can view own template settings"
      ON template_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'template_settings' 
    AND policyname = 'Users can manage own template settings'
  ) THEN
    CREATE POLICY "Users can manage own template settings"
      ON template_settings
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Create index if it doesn't exist
  CREATE INDEX IF NOT EXISTS idx_template_settings_user_id ON template_settings(user_id);
END $$;