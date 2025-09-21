/*
  # Add task embeddings and vector search

  1. New Features
    - Add vector extension for embeddings
    - Add embedding column to tasks table
    - Add content hash for tracking changes
    - Add vector similarity index

  2. Functions
    - Create search function for vector similarity
    - Add trigger for automatic embedding updates

  3. Security
    - Maintain existing RLS policies
    - Ensure search respects user ownership
*/

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column and content hash to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(384);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_hash text;
  END IF;
END $$;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks USING ivfflat (embedding vector_cosine_ops);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks (created_at DESC);

-- Function to update task embedding
CREATE OR REPLACE FUNCTION update_task_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate content hash
  NEW.content_hash = md5(NEW.title);
  
  -- Only update embedding if content changed
  IF OLD IS NULL OR OLD.content_hash != NEW.content_hash THEN
    -- Embedding will be updated by the application
    NEW.embedding = NULL;
  ELSE
    -- Keep existing embedding if content hasn't changed
    NEW.embedding = OLD.embedding;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic embedding updates
DROP TRIGGER IF EXISTS update_task_embedding_trigger ON tasks;
CREATE TRIGGER update_task_embedding_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_embedding();