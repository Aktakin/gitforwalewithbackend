# Mobile App - Quick Start Guide

## How to Run the Mobile App

The mobile app is built with **Expo** (React Native). Here's how to get it running:

### Prerequisites

1. **Node.js** installed (v14 or higher)
2. **npm** or **yarn** package manager
3. **Expo Go** app on your phone (download from App Store or Google Play)
4. **Supabase credentials** (same as web app)

### Step 1: Navigate to Mobile App Directory

```bash
cd SkillBApp
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note:** If you get peer dependency errors, you can use:
```bash
npm install --legacy-peer-deps
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the `SkillBApp` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Start the App

Run one of these commands:

**Option 1: Start Expo (Recommended)**
```bash
npm start
```

**Option 2: Use the batch file (Windows)**
```bash
start.bat
```

**Option 3: Use install and start (Windows)**
```bash
install-and-start.bat
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open Expo DevTools in your browser

### Step 5: Run on Your Device

#### Option A: Using Expo Go App (Easiest)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code**:
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and tap "Scan QR code"

3. The app will load on your device!

#### Option B: Using Android Emulator

```bash
npm run android
```

**Note:** Requires Android Studio and an emulator set up.

#### Option C: Using iOS Simulator (Mac only)

```bash
npm run ios
```

**Note:** Requires Xcode installed.

### Troubleshooting

#### Issue: "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Expo Go version mismatch
- Make sure your Expo Go app is updated to the latest version
- The app uses Expo SDK 54

#### Issue: Connection errors
- Make sure your phone and computer are on the same Wi-Fi network
- Try using the tunnel option: `npm start -- --tunnel`

#### Issue: Environment variables not loading
- Make sure `.env` file is in the `SkillBApp` directory
- Restart the Expo server after creating/updating `.env`
- Variables must start with `EXPO_PUBLIC_`

### Available Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Start for Android
npm run android

# Start for iOS (Mac only)
npm run ios

# Start with tunnel (for testing on different network)
npm start -- --tunnel
```

### Project Structure

```
SkillBApp/
├── src/
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── lib/              # Database helpers (Supabase)
│   ├── navigation/       # Navigation setup
│   ├── screens/          # All app screens
│   ├── theme/            # Colors and themes
│   └── utils/            # Utility functions
├── App.js                # Main app entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── .env                  # Environment variables (create this)
```

### Features Available

✅ Authentication (Login, Register, Forgot Password)
✅ Dashboard
✅ Browse Skills
✅ Browse Requests
✅ Create Skills
✅ Create Requests
✅ View Proposals
✅ Messages
✅ Notifications
✅ Profile Management
✅ Payments (Stripe integration)

### Next Steps

1. **Test the app** on your device using Expo Go
2. **Check authentication** - try logging in with your web account
3. **Test features** - create skills, browse requests, etc.
4. **Build for production** when ready (see Expo docs)

### Building for Production

When you're ready to release:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Need Help?

- Check `ENV_SETUP_INSTRUCTIONS.md` for detailed environment setup
- Check `SUPABASE_SETUP.md` for Supabase configuration
- Check `AUTHENTICATION_SETUP.md` for auth setup
- Expo Docs: https://docs.expo.dev/

