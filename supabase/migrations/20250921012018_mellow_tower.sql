/*
  # Add subtasks table

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key)
      - `parent_task_id` (uuid, foreign key to tasks)
      - `title` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subtasks` table
    - Add policies for authenticated users to manage subtasks of their own tasks

  3. Changes
    - Add foreign key constraint linking subtasks to tasks
    - Add check constraint for subtask status values
*/

CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for status values
ALTER TABLE subtasks ADD CONSTRAINT subtasks_status_check 
  CHECK (status IN ('pending', 'in-progress', 'done'));

-- Enable RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for subtasks
CREATE POLICY "Users can read subtasks of their own tasks"
  ON subtasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subtasks for their own tasks"
  ON subtasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subtasks of their own tasks"
  ON subtasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND tasks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subtasks of their own tasks"
  ON subtasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.parent_task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS subtasks_parent_task_id_idx ON subtasks(parent_task_id);
CREATE INDEX IF NOT EXISTS subtasks_status_idx ON subtasks(status);
CREATE INDEX IF NOT EXISTS subtasks_created_at_idx ON subtasks(created_at DESC);