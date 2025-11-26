# Navigation Debugging Guide

## Current Setup

The navigation should work as follows:

1. **Before Login**: Shows `AuthStack` (Login/Register screens)
2. **After Login**: Automatically switches to `MainTabs` (Dashboard with bottom tabs)

## How It Works

- `AppNavigator` checks `isAuthenticated` from `AuthContext`
- When `isAuthenticated` becomes `true`, it renders `<MainTabs />`
- When `isAuthenticated` is `false`, it renders `<AuthStack />`

## Common Issues & Solutions

### Issue 1: Tabs not showing after login

**Check:**
1. Is `isAuthenticated` actually becoming `true`?
   - Add console logs in `AppNavigator` (already added)
   - Check browser/Expo console for "AppNavigator - Auth State" logs

2. Is the package installed?
   ```bash
   cd SkillBApp
   npm install @react-navigation/bottom-tabs
   ```

3. Clear cache and restart:
   ```bash
   npm start -- --clear
   ```

### Issue 2: Still showing login screen after login

**Check:**
- `AuthContext` might not be setting `isAuthenticated` to `true`
- Check if `loadUserProfile` is being called
- Check if `setIsAuthenticated(true)` is being called in `AuthContext`

### Issue 3: Bottom tabs not visible

**Possible causes:**
- Tab bar might be hidden behind safe area
- Check if `useSafeAreaInsets` is working
- Tab bar might be off-screen (check height settings)

### Debug Steps

1. **Check auth state:**
   - Open browser console or Expo logs
   - Look for: "AppNavigator - Auth State" logs
   - Verify `isAuthenticated: true` after login

2. **Check if tabs are rendering:**
   - Add `console.log('MainTabs rendering')` in `MainTabs` component
   - Check if it logs after login

3. **Check tab bar visibility:**
   - Try scrolling to bottom of screen
   - Check if tab bar is there but hidden
   - Try adjusting `tabBarStyle.height`

4. **Manual test:**
   - Temporarily set `isAuthenticated` to `true` in `AppNavigator` to see if tabs show

## Quick Fix Commands

```bash
# Navigate to app directory
cd SkillBApp

# Install dependencies
npm install

# Clear cache and restart
npm start -- --clear

# If still not working, reinstall everything
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

## Expected Behavior

After successful login:
1. Login screen should disappear
2. Dashboard screen should appear
3. Bottom tab bar should be visible with 4 tabs:
   - Home (Dashboard)
   - Requests
   - Messages
   - Profile
4. Tapping tabs should switch between screens







