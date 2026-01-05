# Setup Profile Picture Upload

## Overview
The profile edit page now supports:
- ✅ Upload photos from your device
- ✅ Take photos live using your camera
- ✅ Automatic upload to Supabase Storage
- ✅ Profile picture preview

## Step 1: Create Supabase Storage Bucket

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project
   - Go to **Storage** in the left sidebar

2. **Create a New Bucket**
   - Click **"New bucket"**
   - Name: `avatars` (or `profile-pictures`)
   - Make it **Public** (so profile pictures can be viewed)
   - Click **"Create bucket"**

3. **Set Up Bucket Policies** (if needed)
   - Go to **Storage** → **Policies**
   - Select your bucket
   - Add policies to allow:
     - **Upload**: Users can upload their own profile pictures
     - **Read**: Anyone can view profile pictures

## Step 2: Test the Feature

1. **Go to Profile Edit Page**
   - Navigate to `/profile/edit` in your app
   - Or go to your profile and click "Edit Profile"

2. **Upload a Photo**
   - Click **"Upload Photo"** button
   - Select an image from your device
   - The image will upload automatically
   - You'll see a preview immediately

3. **Take a Live Photo**
   - Click **"Take Photo"** button
   - Allow camera access when prompted
   - Position yourself in the camera view
   - Click **"Capture Photo"**
   - The photo will upload automatically

4. **Save Your Profile**
   - Click **"Save Changes"** at the bottom
   - Your profile picture will be updated!

## Troubleshooting

### "Bucket not found" Error
- Make sure you created the `avatars` bucket in Supabase Storage
- The code will try `avatars` first, then `profile-pictures` as fallback

### Camera Not Working
- Make sure you're using HTTPS (required for camera access)
- Check browser permissions for camera access
- Try a different browser (Chrome, Firefox, Edge)

### Image Not Uploading
- Check browser console (F12) for error messages
- Verify Supabase Storage bucket is public
- Check that you're logged in (authentication required)

### Image Not Showing After Upload
- Check the profile picture URL in the text field
- Make sure the storage bucket is set to **Public**
- Try refreshing the page

## Storage Structure

Images are stored in:
```
avatars/
  └── {user-id}/
      └── {timestamp}.{extension}
```

Example:
```
avatars/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 1703123456789.jpg
```

## Security Notes

- Only authenticated users can upload
- Users can only upload to their own folder (`{user-id}/`)
- Images are public for viewing (profile pictures need to be visible)
- Consider adding image size/type validation in production

