# 🚀 Quick Database Setup - Link Web & Mobile

## 📋 Prerequisites

1. ✅ Supabase account (sign up at https://app.supabase.com)
2. ✅ Supabase project created
3. ✅ Database schema already run (`supabase-schema-complete-fixed.sql`)

---

## ⚡ 5-Minute Setup

### **Step 1: Get Supabase Credentials** (2 minutes)

1. Go to **https://app.supabase.com**
2. Click on your **SkillBridge** project
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:

```
Project URL: https://xxxxx.supabase.co
Anon key: eyJxxx...xxx (long string)
```

---

### **Step 2: Configure Web App** (1 minute)

Create a file named `.env` in the **root directory** (same level as `package.json`):

```bash
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...xxx
```

**Replace** `xxxxx.supabase.co` and `eyJxxx...xxx` with your actual values!

---

### **Step 3: Configure Mobile App** (1 minute)

Create a file named `.env` in the **SkillBApp directory**:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...xxx
```

**Use the SAME URL and key as the web app!**

---

### **Step 4: Restart Apps** (1 minute)

#### Web App:
```bash
# Stop with Ctrl+C, then:
npm start
```

#### Mobile App:
```bash
cd SkillBApp
# Stop with Ctrl+C, then:
npx expo start
```

---

## ✅ Verify It's Working

### Web App (Open browser console F12):
```
✅ Should see: "Supabase connected"
❌ If error: Check .env file exists and values are correct
```

### Mobile App (Check terminal):
```
✅ Should see: "Supabase initialized"
❌ If error: Check SkillBApp/.env file exists and values are correct
```

### Test Real-Time Sync:
1. Create a request on **web**
2. Open **mobile** app
3. Request should appear immediately! ✅

---

## 🎯 What You Get

When both apps use the same database:

| Action | Result |
|--------|--------|
| Create request on web | Appears on mobile instantly |
| Submit proposal on mobile | Appears on web instantly |
| Send message on mobile | Received on web instantly |
| Accept proposal on web | Provider notified on mobile instantly |
| Update profile on web | Changes visible on mobile instantly |

**Everything syncs in real-time!** 🎉

---

## 🔧 Common Issues

### ❌ "Supabase credentials not configured"

**Fix:**
1. Check `.env` file exists in correct location
2. Check variable names are EXACTLY correct:
   - Web: `REACT_APP_SUPABASE_URL`
   - Mobile: `EXPO_PUBLIC_SUPABASE_URL`
3. No quotes needed around values
4. No spaces around `=`
5. Restart app after creating `.env`

### ❌ Data not syncing

**Fix:**
1. Verify **BOTH** apps use the **SAME** URL and key
2. Log in with the same account on both platforms
3. Refresh the page/app
4. Check Supabase Dashboard → Logs for errors

### ❌ "Infinite recursion detected"

**Fix:** Run this SQL in Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;

CREATE POLICY "requests_select_policy" ON public.requests
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR status = 'open' OR is_public = true);
```

---

## 📁 File Structure

```
Your Project/
├── .env  ← Web app credentials
├── package.json
├── src/
│   └── lib/
│       └── supabase.js  ← Web Supabase config
└── SkillBApp/
    ├── .env  ← Mobile app credentials
    └── src/
        └── lib/
            └── supabase.js  ← Mobile Supabase config
```

---

## 🔒 Security Checklist

- [x] Never commit `.env` files to GitHub
- [x] Both `.env` files should be in `.gitignore`
- [x] Use Anon key (NOT Service key)
- [x] Keep credentials private
- [x] RLS policies enabled in database

---

## 🎊 You're Done!

Your web and mobile apps are now connected to the **same database**!

Test it out:
1. ✅ Log in on web
2. ✅ Log in on mobile (same account)
3. ✅ Create something on web
4. ✅ See it appear on mobile instantly!

**Enjoy your synchronized multi-platform app!** 🚀

