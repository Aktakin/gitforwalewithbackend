# SkillBridge Mobile App

A React Native mobile application built with Expo, featuring sophisticated authentication screens matching the website design.

## Features

✅ **Authentication Screens**
- Login screen with email/password
- Register screen with user type selection
- Forgot Password screen
- All matching website design exactly

✅ **Supabase Integration**
- Full authentication support
- Session persistence
- User profile management

✅ **Sophisticated Design**
- Gradient backgrounds matching website (#1E90FF to #5BB3FF)
- White cards with blur effects
- Smooth animations
- Material Design components

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

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

### 3. Start the App

```bash
npm start
```

### 4. Test on Your Device

1. Install **Expo Go** app on your phone (SDK 54)
2. Scan the QR code from the terminal
3. You'll see the Login screen!

## Project Structure

```
SkillBApp/
├── src/
│   ├── contexts/
│   │   └── AuthContext.js       # Authentication logic
│   ├── lib/
│   │   └── supabase.js          # Supabase client
│   ├── navigation/
│   │   └── AppNavigator.js      # Navigation setup
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   └── DashboardScreen.js
│   └── theme/
│       ├── colors.js            # Color palette
│       └── paperTheme.js        # React Native Paper theme
├── App.js                        # Main app component
└── package.json
```

## Authentication Flow

1. **Login**: Email and password authentication
2. **Register**: New user registration with user type selection
3. **Forgot Password**: Password reset via email
4. **Session Management**: Automatic session persistence

## Design Features

- **Exact color matching**: Blue gradient (#1E90FF to #5BB3FF)
- **Sophisticated UI**: White cards with elevation and blur effects
- **Smooth animations**: Fade-in transitions
- **Material Design**: React Native Paper components
- **Responsive**: Works on all screen sizes

## Next Steps

- [ ] Add profile management
- [ ] Implement skill browsing
- [ ] Add messaging functionality
- [ ] Implement notifications
