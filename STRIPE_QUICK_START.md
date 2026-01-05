# ⚡ Stripe Quick Start

## What You Need

1. **Stripe Test Keys** (from https://dashboard.stripe.com/test/apikeys)
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

## Setup Steps

### 1. Install Backend Dependencies

```bash
npm install express stripe cors dotenv
```

### 2. Create `.env` File (Root Directory)

```env
# Supabase (if not already set)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments
```

### 3. Create Backend `.env` (Same Directory)

For the payment API server, create a `.env` file with:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Start Backend API Server

```bash
npm run payment-api
```

Or:

```bash
node server/payment-api.js
```

### 5. Start Frontend

```bash
npm start
```

### 6. Test Payment

1. Accept a proposal
2. Use test card: `4242 4242 4242 4242`
3. Expiry: Any future date (e.g., 12/25)
4. CVC: Any 3 digits (e.g., 123)

## ✅ Verification

- Payment modal should show Stripe Elements (not "Mock Payment Mode")
- Backend console shows: `✅ Stripe Payment API server running on port 3001`
- Frontend console shows: `✅ Using Stripe payment provider`

## 📖 Full Guide

See `STRIPE_INTEGRATION_GUIDE.md` for detailed instructions and troubleshooting.

