@@ .. @@
 -- Create storage bucket for profile pictures
 INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 VALUES (
   'profile-pictures',
   'profile-pictures',
   true,
   5242880, -- 5MB in bytes
   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
 )
 ON CONFLICT (id) DO NOTHING;

 -- Create policies for the profile-pictures bucket
-CREATE POLICY "Authenticated users can upload profile pictures"
+CREATE POLICY "Allow authenticated uploads"
 ON storage.objects
 FOR INSERT
 TO authenticated
-WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
+WITH CHECK (bucket_id = 'profile-pictures');

-CREATE POLICY "Authenticated users can update their profile pictures"
+CREATE POLICY "Allow authenticated updates"
 ON storage.objects
 FOR UPDATE
 TO authenticated
-USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated')
-WITH CHECK (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
+USING (bucket_id = 'profile-pictures')
+WITH CHECK (bucket_id = 'profile-pictures');

-CREATE POLICY "Authenticated users can delete their profile pictures"
+CREATE POLICY "Allow authenticated deletes"
 ON storage.objects
 FOR DELETE
 TO authenticated
-USING (bucket_id = 'profile-pictures' AND auth.role() = 'authenticated');
+USING (bucket_id = 'profile-pictures');

 CREATE POLICY "Public can view profile pictures"
 ON storage.objects
 FOR SELECT
 TO public
 USING (bucket_id = 'profile-pictures');