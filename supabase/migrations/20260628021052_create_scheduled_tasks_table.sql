/*
# Create scheduled_tasks table

1. New Tables
- `scheduled_tasks`
  - `id` (uuid, primary key) - unique task identifier
  - `name` (text) - human-readable task name
  - `cron_expression` (text) - cron schedule expression
  - `prompt` (text) - the prompt to send to the AI when triggered
  - `channel` (text) - where to deliver: 'cli', 'telegram', or 'discord'
  - `destination_id` (text) - optional chat ID / channel ID for delivery
  - `is_active` (boolean) - whether the task is currently enabled
  - `last_run` (timestamptz) - last execution time
  - `next_run` (timestamptz) - next scheduled execution time
  - `created_at` (timestamptz) - when the task was created

2. Security
- Enable RLS on `scheduled_tasks`.
- Allow anon + authenticated full access for single-tenant personal assistant.
*/

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cron_expression text NOT NULL,
  prompt text NOT NULL,
  channel text NOT NULL DEFAULT 'cli',
  destination_id text,
  is_active boolean NOT NULL DEFAULT true,
  last_run timestamptz,
  next_run timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON scheduled_tasks;
CREATE POLICY "anon_select_tasks" ON scheduled_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON scheduled_tasks;
CREATE POLICY "anon_insert_tasks" ON scheduled_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON scheduled_tasks;
CREATE POLICY "anon_update_tasks" ON scheduled_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON scheduled_tasks;
CREATE POLICY "anon_delete_tasks" ON scheduled_tasks FOR DELETE
  TO anon, authenticated USING (true);
