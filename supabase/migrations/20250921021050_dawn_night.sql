@@ .. @@
 -- Create RLS policies for the bucket
 insert into storage.policies (name, bucket_id, command, definition, check)
 values (
-  'Users can upload their own profile pictures',
+  'Allow authenticated users to upload profile pictures',
   'profile-pictures',
   'INSERT',
-  'auth.uid()::text = (storage.foldername(name))[1]',
-  'auth.uid()::text = (storage.foldername(name))[1]'
+  'auth.role() = ''authenticated''',
+  'auth.role() = ''authenticated'''
 );
 
 insert into storage.policies (name, bucket_id, command, definition)
 values (
-  'Users can update their own profile pictures',
+  'Allow authenticated users to update their profile pictures',
   'profile-pictures',
   'UPDATE',
-  'auth.uid()::text = (storage.foldername(name))[1]'
+  'auth.role() = ''authenticated'''
 );
 
 insert into storage.policies (name, bucket_id, command, definition)
 values (
-  'Users can delete their own profile pictures',
+  'Allow authenticated users to delete their profile pictures',
   'profile-pictures',
   'DELETE',
-  'auth.uid()::text = (storage.foldername(name))[1]'
+  'auth.role() = ''authenticated'''
 );