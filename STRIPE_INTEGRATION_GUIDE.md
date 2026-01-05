# 💳 Stripe Integration Guide

This guide will help you integrate Stripe payment processing into your SkillBridge application.

## 📋 Prerequisites

1. **Stripe Account** - Sign up at https://stripe.com
2. **Stripe Test Keys** - Get from Stripe Dashboard → Developers → API keys
3. **Node.js Backend** - For secure payment operations (payment intent creation)

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Get Your Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_...`)
3. Copy your **Secret key** (starts with `sk_test_...`) - Keep this secret!

### Step 2: Set Up Backend API Server

The backend server is required to securely create payment intents (the secret key must never be exposed to the frontend).

#### Option A: Use the Provided Server (Recommended)

1. **Install dependencies:**
   ```bash
   npm install express stripe cors dotenv
   ```

2. **Create `.env` file in the root directory:**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

3. **Run the server:**
   ```bash
   node server/payment-api.js
   ```

   Or add to `package.json` scripts:
   ```json
   {
     "scripts": {
       "payment-api": "node server/payment-api.js"
     }
   }
   ```

   Then run: `npm run payment-api`

#### Option B: Use Supabase Edge Functions (Alternative)

If you prefer serverless, you can deploy the payment API as Supabase Edge Functions. See [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions).

### Step 3: Configure Frontend Environment Variables

Create or update `.env` file in the root directory:

```env
# Supabase (if not already set)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments
```

**Important:**
- Replace `pk_test_...` with your actual Stripe publishable key
- If your backend runs on a different port, update `REACT_APP_PAYMENT_API_URL`
- For production, use production keys (`pk_live_...` and `sk_live_...`)

### Step 4: Restart Your Development Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### Step 5: Test the Integration

1. **Start the backend API server:**
   ```bash
   node server/payment-api.js
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```

3. **Test a payment:**
   - Accept a proposal
   - Click "Pay" when the payment modal opens
   - Use Stripe test card: `4242 4242 4242 4242`
   - Use any future expiry date (e.g., 12/25)
   - Use any 3-digit CVC (e.g., 123)
   - Use any postal code

---

## 🧪 Stripe Test Cards

Use these test cards in Stripe test mode:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Visa - Success |
| `4000 0000 0000 0002` | Visa - Declined |
| `4000 0000 0000 9995` | Requires authentication |
| `5555 5555 5555 4444` | Mastercard - Success |
| `5200 8282 8282 8210` | Mastercard - Success |

**Test Details:**
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **Postal Code:** Any 5 digits (e.g., 12345)

---

## 📁 File Structure

After integration, your payment system includes:

```
├── src/
│   ├── lib/
│   │   ├── stripeService.js          # Stripe API client
│   │   ├── paymentService.js         # Main payment service (uses Stripe)
│   │   └── paymentServiceMock.js     # Mock service (fallback)
│   ├── components/
│   │   └── payment/
│   │       ├── PaymentModal.js       # Payment UI with Stripe Elements
│   │       └── PaymentForm.js         # Alternative payment form
│   └── index.js                      # Stripe initialization
├── server/
│   └── payment-api.js                # Backend API for Stripe operations
└── .env                              # Environment variables
```

---

## 🔧 How It Works

### Payment Flow:

1. **User accepts proposal** → Payment modal opens
2. **Frontend creates payment intent** → Calls backend API (`/api/payments/create-intent`)
3. **Backend creates Stripe Payment Intent** → Returns `clientSecret` to frontend
4. **User enters card details** → Stripe Elements (secure, PCI-compliant)
5. **User confirms payment** → Frontend calls `stripe.confirmPayment()`
6. **Stripe processes payment** → Returns success/failure
7. **Database updated** → Payment status saved to Supabase

### Security:

- ✅ **Secret key** stays on backend (never exposed to frontend)
- ✅ **Card details** handled by Stripe Elements (PCI-compliant)
- ✅ **Payment intents** created server-side
- ✅ **Webhooks** can be set up for async payment status updates

---

## 🐛 Troubleshooting

### Issue: "Stripe not initialized"

**Solution:**
- Check that `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Restart your development server after updating `.env`
- Check browser console for errors

### Issue: "Failed to create payment intent"

**Solution:**
- Ensure backend API server is running (`node server/payment-api.js`)
- Check that `STRIPE_SECRET_KEY` is set in backend `.env`
- Verify `REACT_APP_PAYMENT_API_URL` matches your backend URL
- Check backend console for error messages

### Issue: Payment modal shows "Mock Payment Mode"

**Solution:**
- Stripe publishable key is not configured or invalid
- Check `.env` file has `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- Restart development server

### Issue: CORS errors

**Solution:**
- Update `ALLOWED_ORIGINS` in backend `.env` to include your frontend URL
- Or update `cors()` configuration in `server/payment-api.js`

---

## 🚀 Production Setup

When ready for production:

1. **Switch to production keys:**
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Update API URL:**
   ```env
   REACT_APP_PAYMENT_API_URL=https://your-api-domain.com/api/payments
   ```

3. **Deploy backend API:**
   - Deploy `server/payment-api.js` to a hosting service (Heroku, Railway, Render, etc.)
   - Or use Supabase Edge Functions
   - Ensure HTTPS is enabled

4. **Set up webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-api.com/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

5. **Test thoroughly:**
   - Use real test cards in test mode first
   - Then switch to live mode with small test transactions

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## ✅ Verification Checklist

- [ ] Stripe account created
- [ ] Test keys obtained
- [ ] Backend API server running
- [ ] `.env` file configured with Stripe keys
- [ ] Frontend restarted after `.env` update
- [ ] Payment modal shows Stripe Elements (not mock mode)
- [ ] Test payment successful with test card
- [ ] Payment recorded in database

---

## 🎉 You're All Set!

Your Stripe integration is complete! Users can now make real payments (in test mode) using secure Stripe Elements.

**Next Steps:**
- Test the full payment flow
- Set up webhooks for production
- Customize payment UI if needed
- Switch to production keys when ready

