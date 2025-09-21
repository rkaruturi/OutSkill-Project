/*
  # Add profile picture URL to profiles table

  1. Schema Changes
    - Add profile_picture_url column to profiles table
    - Allow null values for users without profile pictures

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Column stores the public URL of the uploaded profile picture
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_picture_url text;
  END IF;
END $$;