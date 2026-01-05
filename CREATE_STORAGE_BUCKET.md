# Create Supabase Storage Bucket for Profile Pictures

## Quick Setup (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to **https://app.supabase.com**
2. Sign in to your account
3. Select your project from the project list

### Step 2: Navigate to Storage
1. In the left sidebar, click **"Storage"** (it has a folder icon)
2. You should see a page that says "Create a new bucket" or shows existing buckets

### Step 3: Create the Bucket
1. Click the **"New bucket"** button (usually in the top right)
2. A dialog will appear with these fields:
   - **Name**: Enter `avatars` (exactly as shown, lowercase)
   - **Public bucket**: Toggle this to **ON** (this is important!)
   - **File size limit**: Leave default or set to 5MB
   - **Allowed MIME types**: Leave empty (allows all image types)
3. Click **"Create bucket"**

### Step 4: Set Up Storage Policies (Important!)

After creating the bucket, you need to set up policies so users can upload:

1. **Go to Storage Policies**
   - In the Storage page, click on your `avatars` bucket
   - Click on the **"Policies"** tab at the top
   - Or go to **Storage** → **Policies** in the left sidebar

2. **Create Upload Policy**
   - Click **"New Policy"** or **"Add Policy"**
   - Select **"For full customization"** or **"Custom policy"**
   - Policy name: `Allow authenticated users to upload profile pictures`
   - Allowed operation: **INSERT** (for uploads)
   - Policy definition:
   ```sql
   (bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
   ```
   - This allows users to upload only to their own folder (`{user-id}/`)
   - Click **"Review"** then **"Save policy"**

3. **Create Read Policy** (if bucket is not public)
   - Click **"New Policy"** again
   - Policy name: `Allow public to read profile pictures`
   - Allowed operation: **SELECT** (for reading/viewing)
   - Policy definition:
   ```sql
   (bucket_id = 'avatars'::text)
   ```
   - This allows anyone to view profile pictures
   - Click **"Review"** then **"Save policy"**

### Step 5: Verify Setup
1. Go back to **Storage** → **Buckets**
2. You should see `avatars` in the list
3. It should show as **"Public"** (green badge)
4. Click on it to see it's empty (ready for uploads)

### Step 6: Test in Your App
1. Go to your app's profile edit page
2. Try uploading a profile picture
3. It should work now! ✅

## Alternative: Using SQL Editor

If you prefer SQL, you can also create the bucket using SQL:

1. Go to **SQL Editor** → **New Query**
2. Run this SQL:

```sql
-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload
CREATE POLICY "Allow authenticated users to upload profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Create policy for public to read
CREATE POLICY "Allow public to read profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

3. Click **"Run"** to execute

## Troubleshooting

### "Bucket not found" Error
- ✅ Make sure you created the bucket named exactly `avatars` (lowercase)
- ✅ Check that the bucket exists in Storage → Buckets
- ✅ Try refreshing the page and uploading again

### "Permission denied" Error
- ✅ Make sure the bucket is set to **Public**
- ✅ Check that you've created the storage policies (Step 4)
- ✅ Make sure you're logged in to your app

### Image Uploads But Doesn't Show
- ✅ Check the browser console (F12) for errors
- ✅ Verify the bucket is public
- ✅ Check that the URL in the profile picture field is correct
- ✅ Try refreshing the page

### Still Having Issues?
1. Check browser console (F12) for detailed error messages
2. Verify your Supabase project URL and keys are correct in `.env`
3. Make sure you're logged in (authentication required)
4. Check Supabase Storage logs in the dashboard

## What Gets Created

After setup, your storage structure will be:
```
avatars/
  └── {user-id}/
      └── {timestamp}.jpg
```

Example:
```
avatars/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 1703123456789.jpg
```

Each user can only upload to their own folder, keeping things organized and secure!

