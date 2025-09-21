/*
  # Add vector search function

  1. New Functions
    - search_tasks: Performs vector similarity search
    - Returns tasks with similarity scores above threshold

  2. Security
    - Respects RLS policies
    - Only returns user's own tasks
    - Filters by similarity threshold
*/

-- Function to search tasks using vector similarity
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
    t.id,
    t.title,
    t.priority,
    t.status,
    t.created_at,
    (1 - (t.embedding <=> query_embedding)) as similarity
  FROM tasks t
  WHERE 
    t.user_id = search_tasks.user_id
    AND t.embedding IS NOT NULL
    AND (1 - (t.embedding <=> query_embedding)) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;