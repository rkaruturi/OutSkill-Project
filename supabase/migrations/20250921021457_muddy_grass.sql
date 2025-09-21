@@ .. @@
 -- Create RLS policies for the bucket
 CREATE POLICY "Allow authenticated users to upload profile pictures"
   ON storage.objects
   FOR INSERT
   TO authenticated
-  WITH CHECK (bucket_id = 'profile-pictures');
+  WITH CHECK ((bucket_id = 'profile-pictures'::text) AND (name ~~ ('profile-pictures/' || auth.uid() || '%')));

 CREATE POLICY "Allow authenticated users to update their profile pictures"
   ON storage.objects
   FOR UPDATE
   TO authenticated
-  USING (bucket_id = 'profile-pictures')
-  WITH CHECK (bucket_id = 'profile-pictures');
+  USING ((bucket_id = 'profile-pictures'::text) AND (name ~~ ('profile-pictures/' || auth.uid() || '%')))
+  WITH CHECK ((bucket_id = 'profile-pictures'::text) AND (name ~~ ('profile-pictures/' || auth.uid() || '%')));

 CREATE POLICY "Allow authenticated users to delete their profile pictures"
   ON storage.objects
   FOR DELETE
   TO authenticated
-  USING (bucket_id = 'profile-pictures');
+  USING ((bucket_id = 'profile-pictures'::text) AND (name ~~ ('profile-pictures/' || auth.uid() || '%')));

 CREATE POLICY "Allow public access to view profile pictures"
   ON storage.objects
   FOR SELECT
   TO public
   USING (bucket_id = 'profile-pictures');