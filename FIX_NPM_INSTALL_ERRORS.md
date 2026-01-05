# Fix npm Install Errors - Quick Guide

## Problem
Getting `npm error ERESOLVE` when running `npm install` due to dependency conflicts between `react-native`, `expo`, and `@mui` packages.

## Solution: Use Legacy Peer Deps

The web app has some mobile dependencies (`react-native`, `expo`) that cause conflicts, but they don't affect the web app functionality. Use this workaround:

### Step 1: Clean Previous Attempts

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

**Mac/Linux:**
```bash
rm -rf node_modules package-lock.json
```

### Step 2: Install with Legacy Peer Deps Flag

```bash
npm install --legacy-peer-deps
```

This flag tells npm to ignore peer dependency conflicts and install anyway.

### Step 3: Start the App

```bash
npm start
```

The app should start normally at `http://localhost:3000`.

---

## Alternative: If Legacy Peer Deps Doesn't Work

### Option A: Use npm with force flag

```bash
npm install --legacy-peer-deps --force
```

### Option B: Use yarn instead of npm

1. Install yarn globally:
   ```bash
   npm install -g yarn
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the app:
   ```bash
   yarn start
   ```

---

## Why This Happens

The `package.json` includes `react-native` and `expo` dependencies (used for the mobile app in `SkillBApp/` folder), but these conflict with Material-UI's type definitions. The web app doesn't actually use these packages, so ignoring the conflicts is safe.

---

## Verify It's Working

1. After `npm install --legacy-peer-deps`, you should see:
   - ✅ "added X packages" message
   - ⚠️ Some warnings (these are safe to ignore)

2. After `npm start`, you should see:
   - ✅ "Compiled successfully!"
   - ✅ Browser opens to `http://localhost:3000`
   - ✅ No errors in browser console

---

## Still Having Issues?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be v16 or higher (v18+ recommended)

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Try installing specific packages:**
   ```bash
   npm install --legacy-peer-deps --verbose
   ```
   This shows more details about what's happening.

---

## Quick Command Reference

```bash
# Clean install (recommended)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Start app
npm start
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
npm start
```


