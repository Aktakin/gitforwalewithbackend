# TestFlight Release — What's Done and What's Left

Everything in this checklist that I can automate is **already done** in the repo. The remaining items need your hands because they require **your Apple account** or **your EAS auth**.

---

## Already done (in this repo)

- App icon, adaptive icon, and splash image placed at `SkillBApp/assets/`.
- `app.json` references the icon/splash, sets `usesNonExemptEncryption: false` (skips Apple's encryption questionnaire on every build), and has `bundleIdentifier: com.skillbridge.app`, `versionCode: 1`, `buildNumber: 1`.
- `eas.json` has `production` build + `submit.production.ios` ready to fill in.
- `.env.example` and `SkillBApp/.env.example` provide templates for env vars.

> The generated icon is a placeholder bridge + "SB" mark in royal blue. Replace `SkillBApp/assets/icon.png` (and `adaptive-icon.png`, `splash.png`) with your final art any time before submission — keep the filenames the same.

---

## Steps you must run (15–30 min of clicks + ~25 min cloud build)

### 1. One-time Apple Developer account

If you don't already have one:

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/).
2. Pay the $99/year fee with your Apple ID.
3. Wait for activation email (a few hours, sometimes ~1 day).
4. Sign in once at [appstoreconnect.apple.com](https://appstoreconnect.apple.com) so the account is provisioned.

### 2. Create the app record in App Store Connect (free, ~3 min)

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**.
2. **Platform:** iOS · **Name:** SkillBridge · **Primary Language:** English · **Bundle ID:** `com.skillbridge.app` (select from dropdown, or create it under [Identifiers](https://developer.apple.com/account/resources/identifiers/list)) · **SKU:** `skillbridge-001`.
3. Note the numeric **Apple ID / App ID** shown on the new app's page — you'll need it as `ascAppId`.

### 3. Fill the three values in `eas.json`

Open `SkillBApp/eas.json`, replace:

```json
"appleId": "<your apple developer email>",
"ascAppId": "<numeric app id from step 2>",
"appleTeamId": "<Team ID from developer.apple.com/account/#/membership>"
```

Save and commit.

### 4. EAS account + project link (terminal — ~2 min)

From `SkillBApp/`:

```bash
npm install -g eas-cli
eas login         # creates/uses an Expo account
eas init          # writes real projectId into app.json
```

Commit `app.json`.

### 5. Add production env vars to EAS secrets (~3 min)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://<your>.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<anon key>"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_test_..."   # use pk_live_ later
eas secret:create --scope project --name EXPO_PUBLIC_PAYMENT_API_URL --value "https://<railway>/api/payments"
```

Confirm: `eas secret:list`.

### 6. Build the iOS binary (~15–25 min cloud build)

```bash
eas build --platform ios --profile production
```

First time only, EAS will ask for your Apple ID + an app-specific password / 2FA code and offer to manage iOS credentials. Say yes.

### 7. Upload the build to TestFlight

```bash
eas submit --platform ios --profile production
```

Wait ~5–30 min for Apple to process. You'll get an email when ready.

### 8. Add your client as a TestFlight tester

In [App Store Connect → My Apps → SkillBridge → TestFlight](https://appstoreconnect.apple.com):

- **External tester (recommended):** add Group → **+ Testers** → enter client email or copy the **Public link** Apple gives you. First public build needs a 1–24h Apple Beta Review; later ones don't.
- Client opens the link on their iPhone, installs **TestFlight** app, taps the invite → **Install**.

---

## App Store Connect metadata you'll be asked for (during step 2 and again before public release)

- **App icon (already in repo)**
- **Screenshots** — at least 3, in iPhone 6.7" size (1290×2796 portrait) for the latest devices.
- **Privacy policy URL** — host one on your Vercel site at `/privacy` if not already.
- **App Privacy** answers — declare data collection: email, name, payment info; third parties: Supabase, Stripe.
- **Age rating** answers.
- **Support email / URL**.

For TestFlight-only access you can fill the minimum and skip the full submission for now.

---

## Cost summary

| Item | Cost |
|------|------|
| Apple Developer Program | $99/year |
| Google Play Console | $25 one-time (not needed for TestFlight) |
| EAS Build | Free tier covers small teams; paid tiers exist |
| Railway / Vercel / Supabase / Stripe | Already running |

---

*Anything you want pre-filled — for example `eas.json` with your Apple values or your privacy policy page on the web app — say the word and I'll do it.*
