/*
  # Add Vector Search for Tasks

  1. Extensions
    - Enable vector extension for similarity search
  
  2. Schema Changes
    - Add embedding column to tasks table
    - Add content hash for tracking changes
    - Create vector similarity index
  
  3. Functions
    - Add search function for vector similarity queries
*/

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column and content hash to tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(384);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_hash text;
  END IF;
END $$;

-- Create vector similarity index
CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks USING ivfflat (embedding vector_cosine_ops);

-- Create search function
CREATE OR REPLACE FUNCTION search_tasks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  priority text,
  status text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tasks.id,
    tasks.title,
    tasks.priority,
    tasks.status,
    tasks.created_at,
    1 - (tasks.embedding <=> query_embedding) AS similarity
  FROM tasks
  WHERE tasks.user_id = search_tasks.user_id
    AND tasks.embedding IS NOT NULL
    AND 1 - (tasks.embedding <=> query_embedding) > match_threshold
  ORDER BY tasks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;