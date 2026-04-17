# SkillBridge Mobile — Release Guide (Google Play + App Store)

This guide covers releasing the React Native / Expo app in `SkillBApp/` to both stores using **EAS Build** and **EAS Submit**. Read alongside the main deployment guide for backend and web parts.

---

## Table of contents

1. [What’s already in place](#1-whats-already-in-place)
2. [What you must do before submitting](#2-what-you-must-do-before-submitting)
3. [Accounts and one-time setup](#3-accounts-and-one-time-setup)
4. [Install and initialize EAS](#4-install-and-initialize-eas)
5. [Configure environment and secrets](#5-configure-environment-and-secrets)
6. [App assets and metadata](#6-app-assets-and-metadata)
7. [Build for production](#7-build-for-production)
8. [Submit to stores](#8-submit-to-stores)
9. [Store listing checklist](#9-store-listing-checklist)
10. [Stripe in production (mobile)](#10-stripe-in-production-mobile)
11. [Common blockers](#11-common-blockers)

---

## 1. What’s already in place

- **`SkillBApp/package.json`** — Expo 54, React Native 0.81.5, Stripe React Native, Supabase JS.
- **`SkillBApp/app.json`** — includes `bundleIdentifier`, `package`, `scheme`, `description`, `versionCode`, `buildNumber`, `primaryColor`, and `extra.eas.projectId` placeholder.
- **`SkillBApp/eas.json`** — build profiles (`development`, `preview`, `production`) and a `submit.production` stub for Android + iOS.
- **`SkillBApp/.env.example`** — template with `EXPO_PUBLIC_*` keys (Supabase, Stripe publishable, payment API URL).
- **`SkillBApp/.gitignore`** — ignores `.env`, build outputs, service account JSON.
- **`paymentService.js`** — warns on release builds when `EXPO_PUBLIC_PAYMENT_API_URL` points at `localhost`.

---

## 2. What you must do before submitting

A store build needs a **publicly reachable HTTPS backend**. In order:

1. **Deploy the payment API** (see `docs/SKILLBRIDGE_DEPLOYMENT_GUIDE.md`, Railway section). You must have a URL like `https://<your-service>.up.railway.app/api/payments`.
2. **Supabase production project** ready with schema + auth settings.
3. **Stripe live keys** ready (or keep test keys for a first sandbox release build — but never test keys in a live App Store/Play release).

---

## 3. Accounts and one-time setup

- **Apple Developer Program** — $99/year, required for App Store distribution.
- **Google Play Console** — one-time $25, required for Play Store.
- **Expo account** — free for small teams; EAS Build has a free tier.

Gather ahead of submission:

- A privacy policy URL (required by both stores).
- A support URL and support email.
- Legal company/developer info.

---

## 4. Install and initialize EAS

From repo root:

```bash
cd SkillBApp
npm install -g eas-cli
eas login
eas init
```

`eas init` will:

- Link this folder to an EAS project.
- Write your real `projectId` into `app.json` `extra.eas.projectId` (replace the placeholder).

Commit the updated `app.json` (no secrets in it).

---

## 5. Configure environment and secrets

### 5.1 Local development

Create `SkillBApp/.env` by copying `.env.example`, fill real test values. Never commit `.env`.

### 5.2 EAS secrets (for production builds)

Set EAS-level secrets so build machines have them at bundle time:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://<project>.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<anon key>"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_..."
eas secret:create --scope project --name EXPO_PUBLIC_PAYMENT_API_URL --value "https://<api>/api/payments"
```

Verify:

```bash
eas secret:list
```

> Use **pk_live_...** only when the app is truly ready for real charges. Otherwise use **pk_test_...**.

---

## 6. App assets and metadata

### 6.1 Required images

Create the following under `SkillBApp/assets/` and reference them in `app.json`:

| File | Size | Purpose |
|------|------|---------|
| `assets/icon.png` | 1024×1024 px, PNG, no alpha | App icon (both stores) |
| `assets/adaptive-icon.png` | 1024×1024 px | Android adaptive icon foreground |
| `assets/splash.png` | ~1284×2778 px (portrait) | Splash screen image |

Then add to `app.json`:

```json
"icon": "./assets/icon.png",
"splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#1E90FF" },
"ios": { "bundleIdentifier": "com.skillbridge.app", "buildNumber": "1", "supportsTablet": true },
"android": {
  "package": "com.skillbridge.app",
  "versionCode": 1,
  "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#1E90FF" }
}
```

### 6.2 Store screenshots and copy

Collect for each store listing (can be prepared alongside building):

- App name: **SkillBridge**
- Short description (80 chars)
- Full description (multi-paragraph)
- 3–5 screenshots per form factor (phone, optionally tablet)
- Feature graphic (Android, 1024×500)
- Age rating inputs
- Contact info, privacy policy URL

---

## 7. Build for production

From `SkillBApp/`:

### 7.1 Android (AAB for Play)

```bash
eas build --platform android --profile production
```

Downloads an `.aab` artifact.

### 7.2 iOS (IPA for App Store Connect)

```bash
eas build --platform ios --profile production
```

EAS will ask for your Apple ID, team, and credentials the first time and store them (optional) for you. It uploads a signed build to Apple.

### 7.3 Internal previews (optional, recommended before production)

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

Android preview is an installable APK; iOS preview uses ad-hoc or internal distribution.

---

## 8. Submit to stores

### 8.1 Google Play

1. In **Play Console**, create a new app (one time) with the same **package name** as `android.package` (`com.skillbridge.app`).
2. Create a **Play service account** with Play Console access:
   - Play Console → Users and permissions → Invite the service account email.
   - Grant "Release Manager" (or similar) with upload rights.
3. Download the JSON key → save at `SkillBApp/play-service-account.json` (already in `.gitignore`).
4. Run:
   ```bash
   eas submit --platform android
   ```
5. First release: submit to **Internal testing** track; after review, promote up to **Closed/Open testing** → **Production**.

### 8.2 Apple App Store

1. In **App Store Connect**, create an app with the same `bundleIdentifier` (`com.skillbridge.app`).
2. Fill `eas.json` `submit.production.ios` with your:
   - `appleId` (Apple ID email)
   - `ascAppId` (App Store Connect app ID)
   - `appleTeamId`
3. Run:
   ```bash
   eas submit --platform ios
   ```
4. In App Store Connect, attach the uploaded build to a version, complete metadata, submit for review.

---

## 9. Store listing checklist

- [ ] App name finalized on both stores.
- [ ] Privacy policy URL accessible (required).
- [ ] Age rating questions answered correctly.
- [ ] Content rating (Play) and App Privacy (Apple) data collection sections completed; declare Stripe/Supabase usage.
- [ ] Screenshots uploaded at correct sizes.
- [ ] App icon and splash correct.
- [ ] No test keys or debug banners in the build.
- [ ] Email and optional phone support are real.

---

## 10. Stripe in production (mobile)

- Use **live publishable** key (`pk_live_...`) via `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Payment API (Railway) must use **live secret** key (`sk_live_...`).
- Real cards only. Stripe test cards won’t work in live mode.
- If you add **Apple Pay**:
  - Register a Merchant ID in the Apple Developer portal (e.g. `merchant.com.skillbridge`).
  - Add the Merchant ID in `app.json` or via `@stripe/stripe-react-native` `initStripe({ merchantIdentifier })`.
- If you add **Google Pay**, configure it in Google Pay API + Stripe dashboard.

---

## 11. Common blockers

| Issue | Fix |
|-------|-----|
| `EXPO_PUBLIC_PAYMENT_API_URL` falls back to `localhost` in a store build | Set the EAS secret or `.env` value to the HTTPS production URL, rebuild. |
| Missing app icon/splash causing build warnings | Add `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png` and reference them in `app.json`. |
| Apple rejects for missing privacy policy | Host a policy page on the Vercel site and link it on App Store Connect. |
| Play Console rejects over data safety | Declare auth, payment, and analytics data collection; cite Supabase + Stripe. |
| Build bakes in an old `projectId` placeholder | Run `eas init`, let it rewrite `extra.eas.projectId` in `app.json`, commit. |
| Stripe “Merchant identifier not configured” on iOS | Register a merchant ID with Apple and pass it to `initStripe`. |

---

*End of mobile release guide.*
