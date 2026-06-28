/*
# Create conversations table

1. New Tables
- `conversations`
  - `id` (text, primary key) - unique conversation identifier
  - `title` (text) - human-readable title for the conversation
  - `messages` (jsonb) - array of message objects with role, content, timestamp
  - `created_at` (timestamptz) - when the conversation started
  - `updated_at` (timestamptz) - last activity timestamp

2. Security
- Enable RLS on `conversations`.
- Allow anon + authenticated full access since this is a single-tenant personal assistant.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT 'New Conversation',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);
