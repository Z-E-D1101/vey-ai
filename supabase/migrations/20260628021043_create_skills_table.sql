/*
# Create skills table

1. New Tables
- `skills`
  - `id` (uuid, primary key) - unique skill identifier
  - `name` (text) - skill name
  - `description` (text) - what this skill does
  - `trigger_phrases` (jsonb) - array of phrases that activate this skill
  - `prompt_template` (text) - the specialized prompt template for this skill
  - `usage_count` (integer) - how many times this skill has been used
  - `created_at` (timestamptz) - when the skill was created
  - `updated_at` (timestamptz) - last update timestamp

2. Security
- Enable RLS on `skills`.
- Allow anon + authenticated full access for single-tenant personal assistant.
*/

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  trigger_phrases jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt_template text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_skills" ON skills;
CREATE POLICY "anon_select_skills" ON skills FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_skills" ON skills;
CREATE POLICY "anon_insert_skills" ON skills FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_skills" ON skills;
CREATE POLICY "anon_update_skills" ON skills FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_skills" ON skills;
CREATE POLICY "anon_delete_skills" ON skills FOR DELETE
  TO anon, authenticated USING (true);
