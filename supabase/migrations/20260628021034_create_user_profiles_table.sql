/*
# Create user_profiles table

1. New Tables
- `user_profiles`
  - `id` (uuid, primary key) - unique profile identifier
  - `name` (text) - user's preferred name
  - `preferences` (jsonb) - key-value store of user preferences
  - `facts` (jsonb) - array of learned facts about the user
  - `created_at` (timestamptz) - when the profile was created
  - `updated_at` (timestamptz) - last update timestamp

2. Security
- Enable RLS on `user_profiles`.
- Allow anon + authenticated full access for single-tenant personal assistant.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'User',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON user_profiles;
CREATE POLICY "anon_select_profiles" ON user_profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON user_profiles;
CREATE POLICY "anon_insert_profiles" ON user_profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON user_profiles;
CREATE POLICY "anon_update_profiles" ON user_profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON user_profiles;
CREATE POLICY "anon_delete_profiles" ON user_profiles FOR DELETE
  TO anon, authenticated USING (true);
