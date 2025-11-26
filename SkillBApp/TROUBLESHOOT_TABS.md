# Troubleshooting: Bottom Tabs Not Showing

## Step-by-Step Fix

### Step 1: Verify Package Installation

Run this command in the `SkillBApp` directory:

```bash
npm list @react-navigation/bottom-tabs
```

**Expected output:** `@react-navigation/bottom-tabs@6.5.20`

**If not found or error:**
```bash
npm install @react-navigation/bottom-tabs@^6.5.20
```

### Step 2: Clear Cache and Reinstall

```bash
cd SkillBApp
rm -rf node_modules package-lock.json .expo
npm install
npm start -- --clear
```

### Step 3: Check Console Logs

After login, look for these logs in Expo console:

1. **"=== MainTabs Component Rendered ==="** 
   - If you see this → Tabs component is rendering
   - If you DON'T see this → `isAuthenticated` is false

2. **"AppNavigator Debug Info"**
   - Check `isAuthenticated: true` after login
   - If `false`, auth is not working

### Step 4: Test with Minimal Version

If tabs still don't show, temporarily test with minimal version:

1. Backup current file:
   ```bash
   cp src/navigation/AppNavigator.js src/navigation/AppNavigator.backup.js
   ```

2. Copy minimal version:
   ```bash
   cp src/navigation/AppNavigator.minimal.js src/navigation/AppNavigator.js
   ```

3. Restart Expo and login
   - If tabs show → Issue is with screenOptions or icon setup
   - If tabs still don't show → Package installation issue

### Step 5: Verify Package.json

Check that `package.json` has:
```json
"@react-navigation/bottom-tabs": "^6.5.20"
```

Then run:
```bash
npm install
```

### Step 6: Check for Conflicting Packages

```bash
npm list | grep navigation
```

Should show:
- @react-navigation/native
- @react-navigation/stack  
- @react-navigation/bottom-tabs

All should be version 6.x

## Common Issues

### Issue: "Unable to resolve module @react-navigation/bottom-tabs"
**Solution:** 
```bash
cd SkillBApp
npm install @react-navigation/bottom-tabs@^6.5.20
```

### Issue: Tabs render but not visible
**Possible causes:**
- Screen content covering tabs (fixed with paddingBottom)
- Tab bar positioned off-screen
- Z-index issues

**Solution:** Check if you can scroll down and see tabs at bottom

### Issue: isAuthenticated stays false
**Solution:** Check `AuthContext` - `setIsAuthenticated(true)` must be called after login

## Quick Test Commands

```bash
# Navigate to app
cd SkillBApp

# Verify package
npm list @react-navigation/bottom-tabs

# If not found, install
npm install @react-navigation/bottom-tabs@^6.5.20

# Clear everything and restart
rm -rf node_modules .expo package-lock.json
npm install
npm start -- --clear
```

## What to Share for Help

If still not working, share:

1. **Console output** - Especially:
   - "AppNavigator Debug Info"
   - "MainTabs Component Rendered"
   - Any error messages

2. **npm list output:**
   ```bash
   npm list @react-navigation/bottom-tabs
   ```

3. **What you see after login:**
   - Dashboard screen?
   - Blank screen?
   - Error message?

4. **Screenshot** of the app after login







