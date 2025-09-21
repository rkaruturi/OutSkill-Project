/*
  # Update profiles table for profile pictures

  1. Changes
    - Add `profile_picture_url` column to store profile image URLs
    - Update existing policies to handle the new column

  2. Storage
    - Profile pictures will be stored in Supabase Storage bucket 'profile-pictures'
*/

-- Add profile picture URL column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_picture_url text;
  END IF;
END $$;