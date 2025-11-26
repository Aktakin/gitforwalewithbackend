# 🔍 Authentication Diagnostic Guide

## ❌ Problem: Login works on web but not on mobile (or vice versa)

This happens when the apps are **not using the same Supabase credentials**.

---

## ✅ Quick Fix (3 Steps)

### **Step 1: Verify Web App Credentials**

1. Check if `.env` file exists in **root directory**
2. Open it and check:

```bash
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxxx...
```

**If file doesn't exist or has placeholder values, CREATE IT with real credentials!**

---

### **Step 2: Verify Mobile App Credentials**

1. Check if `.env` file exists in **SkillBApp directory**
2. Open it and check:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
```

**If file doesn't exist or has placeholder values, CREATE IT with real credentials!**

---

### **Step 3: Verify Credentials Match**

**CRITICAL:** Both files MUST have the **EXACT SAME** Supabase URL and key!

```
✅ CORRECT:
Web:    REACT_APP_SUPABASE_URL=https://abc123.supabase.co
Mobile: EXPO_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
        ↑ SAME URL ↑

❌ WRONG:
Web:    REACT_APP_SUPABASE_URL=https://project1.supabase.co
Mobile: EXPO_PUBLIC_SUPABASE_URL=https://project2.supabase.co
        ↑ DIFFERENT URLs ↑
```

---

## 🔐 Get Your Supabase Credentials

### Don't have them yet? Here's how to get them:

1. **Go to** https://app.supabase.com
2. **Select** your SkillBridge project (or create one)
3. **Click** Settings (⚙️) → API
4. **Copy** these two values:

```
Project URL: https://xxxxx.supabase.co
Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Create .env Files

### **Web App (.env in root directory):**

```bash
REACT_APP_SUPABASE_URL=https://your-actual-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### **Mobile App (SkillBApp/.env):**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**⚠️ Use your REAL credentials, not the placeholder values above!**

---

## 🔄 Restart Apps After Creating .env

### **Web:**
```bash
# Stop with Ctrl+C
npm start
```

### **Mobile:**
```bash
cd SkillBApp
# Stop with Ctrl+C
npx expo start
```

---

## ✅ Test Authentication

### **Step 1: Register a New User on Web**

1. Open web app
2. Click "Register"
3. Fill in details:
   - Email: test@example.com
   - Password: Test123!
   - Name: Test User
4. Click "Sign Up"
5. ✅ Should see dashboard

### **Step 2: Try Logging In on Mobile**

1. Open mobile app
2. Go to Login screen
3. Enter **SAME** credentials:
   - Email: test@example.com
   - Password: Test123!
4. Click "Login"
5. ✅ Should log in successfully!

---

## 🔍 Debugging Steps

### **Check Web Console (F12):**

```bash
# Look for these messages:
✅ "Supabase connected successfully"
✅ "Auth state changed: SIGNED_IN"
❌ "Supabase credentials not configured"  ← BAD!
❌ "Failed to connect to Supabase"  ← BAD!
```

### **Check Mobile Terminal:**

```bash
# Look for these messages:
✅ "Supabase initialized"
✅ "Auth state changed: SIGNED_IN"
❌ "Supabase credentials not configured"  ← BAD!
❌ "Failed to connect to Supabase"  ← BAD!
```

---

## 🚨 Common Issues

### ❌ Issue 1: "Invalid login credentials"

**Cause:** Using different databases on web vs mobile

**Fix:**
1. Verify both `.env` files exist
2. Verify both use the **SAME** URL and key
3. Restart both apps

---

### ❌ Issue 2: "User already registered" on mobile

**Cause:** User exists in web's database but not in mobile's database

**Fix:**
1. This confirms you're using **different** databases!
2. Update mobile app's `.env` to use the **SAME** credentials as web
3. Restart mobile app
4. Try logging in again (should work now!)

---

### ❌ Issue 3: Login works but user data is different

**Cause:** Different databases

**Fix:**
1. Ensure both `.env` files have **IDENTICAL** URLs and keys
2. Restart both apps
3. Clear app cache/data if needed

---

### ❌ Issue 4: ".env file not being read"

**Fix:**

#### For Web:
1. Ensure file is named exactly `.env` (with the dot)
2. Ensure it's in the **root directory** (same level as `package.json`)
3. Variable names must be exactly: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
4. No quotes needed around values
5. Restart dev server after creating `.env`

#### For Mobile:
1. Ensure file is named exactly `.env` (with the dot)
2. Ensure it's in the **SkillBApp directory** (same level as `package.json`)
3. Variable names must be exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. No quotes needed around values
5. Restart Expo after creating `.env`

---

## 📋 Checklist

Before testing authentication:

- [ ] Web `.env` file exists in root directory
- [ ] Mobile `.env` file exists in SkillBApp directory
- [ ] Both files have **REAL** Supabase credentials (not placeholders)
- [ ] Both files use the **SAME** Supabase URL
- [ ] Both files use the **SAME** Supabase Anon key
- [ ] Variable names are correct (REACT_APP_ for web, EXPO_PUBLIC_ for mobile)
- [ ] Both apps have been restarted after creating `.env` files
- [ ] No errors in web console or mobile terminal

---

## 🎯 Expected Behavior

When authentication is properly linked:

| Action | Result |
|--------|--------|
| Register on web | User created in Supabase |
| Login on mobile with same credentials | ✅ Successful login |
| Logout on web | Session cleared |
| Login on mobile | ✅ Can still login (user persists) |
| Change password on web | ✅ Updated in Supabase |
| Login on mobile with new password | ✅ Works! |

---

## 🔐 How Authentication Works

```
Web App                 Supabase Auth              Mobile App
  |                           |                         |
  |--- Register User -------->|                         |
  |                           |--- Create User          |
  |<-- User Created ----------|                         |
  |                           |                         |
  |                           |<--- Login Request ------|
  |                           |--- Verify User          |
  |                           |--- Send Session ------->|
  |                           |                         |
```

Both apps connect to the **SAME** Supabase Auth service!

---

## 🧪 Manual Test Script

Run this test to verify authentication works:

### **Test 1: Register on Web**
```
1. Open web app
2. Register new user:
   - Email: testuser@example.com
   - Password: SecurePass123!
   - Name: Test User
3. ✅ Should redirect to dashboard
```

### **Test 2: Logout on Web**
```
4. Click logout
5. ✅ Should return to login page
```

### **Test 3: Login on Mobile**
```
6. Open mobile app
7. Enter same credentials:
   - Email: testuser@example.com
   - Password: SecurePass123!
8. ✅ Should log in successfully
9. ✅ Should see same user name
10. ✅ Should see same data
```

### **Test 4: Create Data on Mobile**
```
11. Create a new request on mobile
12. ✅ Request should be created
```

### **Test 5: View Data on Web**
```
13. Go back to web app
14. Refresh page
15. ✅ Should see the request created on mobile
```

**If all tests pass, authentication is properly linked!** ✅

---

## 📞 Still Not Working?

### Send me this info:

1. **Web Console Output:**
   - Open browser (F12)
   - Copy any error messages
   - Look for "Supabase" related messages

2. **Mobile Terminal Output:**
   - Copy the Metro bundler output
   - Look for "Supabase" or "Auth" related messages

3. **Environment Check:**
   - Do `.env` files exist? (Yes/No)
   - Are they using real credentials? (Yes/No)
   - Are the URLs the same? (Yes/No)

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Can register on web
✅ Can login on mobile with same credentials
✅ User profile shows same data on both platforms
✅ Data created on web appears on mobile
✅ Data created on mobile appears on web
✅ Logout works on both platforms
✅ Can switch between platforms seamlessly

---

## 🚀 Next Steps After Authentication Works

Once authentication is linked:
1. ✅ Test creating requests on both platforms
2. ✅ Test submitting proposals
3. ✅ Test messaging system
4. ✅ Test notifications
5. ✅ Test payment flow

**All features will work across platforms!** 🎊

