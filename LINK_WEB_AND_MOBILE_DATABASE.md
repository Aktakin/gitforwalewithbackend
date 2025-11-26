# 🔗 Link Web and Mobile App to Same Database

## ✅ Current Status

Both your **web app** and **mobile app** are already using Supabase! They just need to point to the **same Supabase project**.

---

## 🎯 Step-by-Step Setup

### **Step 1: Get Your Supabase Credentials**

1. Go to **https://app.supabase.com**
2. Select your **SkillBridge** project (or create one if you haven't)
3. Go to **Settings → API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

---

### **Step 2: Configure Web App**

#### Create `.env` file in the root directory:

```bash
# Web App Environment Variables
# File: .env (in the root of your project)

REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace:**
- `https://your-project.supabase.co` with your actual Supabase URL
- `your-anon-key-here` with your actual Anon key

---

### **Step 3: Configure Mobile App**

#### Option A: Create `.env` file in SkillBApp directory:

```bash
# Mobile App Environment Variables
# File: SkillBApp/.env

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Option B: Add to `SkillBApp/app.json`:

```json
{
  "expo": {
    "name": "SkillBridge",
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

**⚠️ Important:** Use the **SAME** URL and Key for both web and mobile!

---

### **Step 4: Restart Both Apps**

#### Web App:
```bash
# Stop the web app (Ctrl+C)
# Then restart:
npm start
```

#### Mobile App:
```bash
cd SkillBApp
# Stop the mobile app (Ctrl+C)
# Then restart:
npx expo start
# or
npm start
```

---

## ✅ Verify Connection

### **Test Web App:**

1. Open browser console (F12)
2. You should see: `✅ Supabase connected successfully`
3. Try logging in or creating a request

### **Test Mobile App:**

1. Check Metro bundler terminal
2. You should see: `✅ Supabase connected`
3. Try logging in or creating a request

---

## 🎯 What's Shared Between Web and Mobile

When both apps use the **same Supabase credentials**, they share:

| Feature | Shared? | Notes |
|---------|---------|-------|
| **Users** | ✅ Yes | Same user accounts |
| **Authentication** | ✅ Yes | Login on web, access on mobile |
| **Requests** | ✅ Yes | Create on web, view on mobile |
| **Proposals** | ✅ Yes | Submit on mobile, accept on web |
| **Messages** | ✅ Yes | Chat across platforms |
| **Notifications** | ✅ Yes | Real-time sync |
| **Payments** | ✅ Yes | Same payment history |
| **Skills** | ✅ Yes | Create once, visible everywhere |

---

## 🔄 Real-Time Sync

Both apps will have **real-time updates**:

1. **Create request on web** → Appears on mobile instantly
2. **Accept proposal on mobile** → Updates on web instantly
3. **Send message on mobile** → Received on web instantly
4. **Update profile on web** → Reflected on mobile instantly

---

## 📱 Example User Flow

### Scenario: Client on Web, Provider on Mobile

1. **Client (Web):**
   - Creates a request: "Need a plumber"
   - Request saved to Supabase database

2. **Provider (Mobile):**
   - Opens mobile app
   - Sees the new request immediately
   - Submits a proposal

3. **Client (Web):**
   - Refreshes proposals page
   - Sees the new proposal
   - Accepts proposal
   - Payment modal appears

4. **Provider (Mobile):**
   - Gets notification: "Your proposal was accepted!"
   - Can start working on the request

**All in real-time, same database!** ✅

---

## 🔐 Database Structure

Both apps use the same database tables:

```
Supabase Database
├── users (shared)
├── skills (shared)
├── requests (shared)
├── proposals (shared)
├── conversations (shared)
├── messages (shared)
├── notifications (shared)
├── payments (shared)
├── transactions (shared)
├── payment_methods (shared)
├── invoices (shared)
├── payouts (shared)
└── wallets (shared)
```

---

## 🎨 Platform-Specific Features

| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| **UI** | Material-UI | React Native Paper | Different UI, same data |
| **Navigation** | React Router | React Navigation | Different routing, same pages |
| **Storage** | localStorage | AsyncStorage | Different storage, same Supabase auth |
| **Notifications** | Browser | Push Notifications | Both use Supabase notifications table |

---

## 🔍 Troubleshooting

### ❌ "Supabase credentials not configured"

**Solution:**
1. Check `.env` file exists in the correct location
2. Restart the app after creating `.env`
3. Verify no typos in variable names (`REACT_APP_` for web, `EXPO_PUBLIC_` for mobile)

### ❌ "Failed to connect to Supabase"

**Solution:**
1. Verify your Supabase URL is correct
2. Check your Anon key is correct
3. Make sure your Supabase project is active
4. Check internet connection

### ❌ Data not syncing between web and mobile

**Solution:**
1. Verify both apps use the **EXACT SAME** Supabase URL and Key
2. Check both apps are logged in as the same user
3. Refresh the page/app
4. Check Supabase logs for errors

### ❌ "User not found" error

**Solution:**
1. Run the database schema SQL in Supabase
2. Make sure RLS policies are set up correctly
3. Verify user exists in `auth.users` table

---

## 📋 Environment Variables Checklist

### ✅ Web App (.env in root):
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
```

### ✅ Mobile App (SkillBApp/.env):
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### ⚠️ Important Rules:
1. ✅ Both use **SAME** Supabase URL
2. ✅ Both use **SAME** Anon Key
3. ✅ No quotes around values
4. ✅ No spaces around `=`
5. ✅ File named exactly `.env` (with the dot)
6. ✅ Restart app after creating/editing `.env`

---

## 🚀 Quick Start Commands

### Setup Web App:
```bash
# Create .env file in root directory
echo "REACT_APP_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "REACT_APP_SUPABASE_ANON_KEY=your-anon-key" >> .env

# Install dependencies (if needed)
npm install

# Start web app
npm start
```

### Setup Mobile App:
```bash
# Navigate to mobile app directory
cd SkillBApp

# Create .env file
echo "EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env

# Install dependencies (if needed)
npm install

# Start mobile app
npx expo start
```

---

## 🎯 Verification Steps

### 1. Check Web Console:
```
Open browser console (F12)
Look for: "✅ Supabase connected"
```

### 2. Check Mobile Terminal:
```
Look in Metro bundler output
Should see: "✅ Supabase initialized"
```

### 3. Test Real-Time Sync:
```
1. Create a request on web
2. Open mobile app
3. Check if request appears
4. ✅ Success if it shows up!
```

---

## 📚 Additional Resources

- **Supabase Dashboard:** https://app.supabase.com
- **Web App Supabase Config:** `src/lib/supabase.js`
- **Mobile App Supabase Config:** `SkillBApp/src/lib/supabase.js`
- **Database Schema:** `supabase-schema-complete-fixed.sql`
- **RLS Policies:** Run SQL in Supabase SQL Editor

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ No errors in web console
2. ✅ No errors in mobile terminal
3. ✅ Can log in on both platforms with same account
4. ✅ Data created on web appears on mobile
5. ✅ Data created on mobile appears on web
6. ✅ Real-time updates work
7. ✅ Notifications sync across platforms

---

## 💡 Pro Tips

1. **Use the same login** on both platforms to test sync
2. **Check Supabase Dashboard** to see database updates in real-time
3. **Use Supabase logs** to debug issues (Supabase Dashboard → Logs)
4. **Test on different devices** to ensure true real-time sync
5. **Keep credentials secret** - never commit `.env` to git

---

## 🔒 Security Notes

✅ **DO:**
- Use environment variables for credentials
- Add `.env` to `.gitignore`
- Use Anon key (not Service key)
- Enable RLS policies

❌ **DON'T:**
- Commit `.env` file to GitHub
- Share your Anon key publicly
- Use Service key in client-side code
- Disable RLS policies in production

---

## 🎊 You're All Set!

Both your web and mobile apps are now connected to the **same Supabase database**!

Any data created on one platform will be instantly available on the other! 🚀

