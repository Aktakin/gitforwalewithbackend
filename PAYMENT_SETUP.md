# Payment System Setup Guide

This guide will help you set up the payment functionality with Stripe escrow system for both web and mobile apps.

## Overview

The payment system implements:
- **Escrow System**: Funds are held until job completion and approval
- **Stripe Integration**: Secure payment processing
- **Payment Approval**: Request owner approves payment release
- **Transaction History**: Complete payment tracking

## Prerequisites

1. Stripe Account (https://stripe.com)
2. Supabase Database (already set up)
3. Backend API endpoint for Stripe operations (see Backend Setup below)

## Step 1: Database Setup

Run the payment schema SQL file in your Supabase SQL Editor:

```bash
# In Supabase Dashboard → SQL Editor
# Run: payment-schema.sql
```

This creates:
- `payments` table - Tracks escrow payments
- `transactions` table - Payment history
- Database functions for payment creation and escrow release

## Step 2: Stripe Account Setup

1. **Create Stripe Account**
   - Go to https://stripe.com and create an account
   - Complete account verification

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Copy your **Publishable Key** (starts with `pk_`)
   - Copy your **Secret Key** (starts with `sk_`) - Keep this secret!

3. **Enable Payment Methods**
   - Dashboard → Settings → Payment methods
   - Enable the payment methods you want (Credit cards, etc.)

## Step 3: Environment Variables

### Web App (.env)

Add to your `.env` file in the root directory:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_PAYMENT_API_URL=http://localhost:3001/api/payments
```

### Mobile App (.env or app.json)

Add to your `SkillBApp/.env` or configure in `app.json`:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_PAYMENT_API_URL=http://localhost:3001/api/payments
```

**Note**: For production, use your production Stripe keys and backend URL.

## Step 4: Backend API Setup

You need a backend API to securely handle Stripe operations. Here's a basic Node.js/Express example:

### Install Dependencies

```bash
npm install express stripe cors dotenv
```

### Backend API Example (server.js)

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create Payment Intent
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm Payment Intent
app.post('/api/payments/confirm-intent', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Payment Status
app.get('/api/payments/status/:paymentIntentId', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.params.paymentIntentId
    );

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment API server running on port ${PORT}`);
});
```

### Backend Environment Variables

Create `.env` in your backend directory:

```env
STRIPE_SECRET_KEY=sk_test_...
PORT=3001
```

## Step 5: Install Frontend Dependencies

### Web App

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Mobile App

```bash
cd SkillBApp
npm install @stripe/stripe-react-native
```

## Step 6: Update Mobile App Navigation

Add the Payment screen to your mobile app navigation:

```javascript
// In SkillBApp/src/navigation/AppNavigator.js
import PaymentScreen from '../screens/PaymentScreen';

// Add to your stack navigator:
<Stack.Screen 
  name="Payment" 
  component={PaymentScreen}
  options={{ title: 'Payment' }}
/>
```

## Step 7: Initialize Stripe in Mobile App

Update your mobile app's main entry point to initialize Stripe:

```javascript
// In SkillBApp/App.js or AppEntry.js
import { initializeStripeMobile } from './src/lib/paymentService';

// Initialize on app start
initializeStripeMobile();
```

## Step 8: Test the Payment Flow

### Test Flow:

1. **Create a Request** - Post a service request
2. **Submit a Proposal** - Provider submits proposal with price
3. **Accept Proposal** - Request owner accepts proposal
4. **Payment Created** - System automatically creates payment record
5. **Make Payment** - Request owner pays (funds held in escrow)
6. **Complete Job** - Provider completes the work
7. **Approve & Release** - Request owner approves and releases funds

### Test Cards (Stripe Test Mode):

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

## Payment Status Flow

```
pending → paid → held → released
```

1. **pending**: Payment record created, awaiting payment
2. **paid**: Payment processed, funds captured
3. **held**: Funds held in escrow (default after payment)
4. **released**: Funds released to provider after approval

## Security Considerations

1. **Never expose Stripe Secret Key** in frontend code
2. **Always use HTTPS** in production
3. **Validate payment amounts** on backend
4. **Implement webhook handlers** for payment status updates
5. **Add rate limiting** to payment endpoints
6. **Log all payment operations** for audit

## Webhook Setup (Recommended)

Set up Stripe webhooks to handle payment status updates:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api.com/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Update payment status in database when webhook received

## Troubleshooting

### Payment Intent Creation Fails

- Check Stripe API keys are correct
- Verify backend API is running
- Check network connectivity
- Review Stripe dashboard for errors

### Mobile Payment Not Working

- Ensure Stripe is initialized on app start
- Check environment variables are set
- Verify payment API URL is accessible
- Check device has internet connection

### Escrow Release Fails

- Verify user is the payer (request owner)
- Check payment status is 'held'
- Review database permissions
- Check function permissions in Supabase

## Production Checklist

- [ ] Switch to production Stripe keys
- [ ] Set up production backend API
- [ ] Configure webhooks
- [ ] Enable HTTPS
- [ ] Set up error monitoring
- [ ] Test complete payment flow
- [ ] Review security settings
- [ ] Set up payment notifications
- [ ] Configure refund policies
- [ ] Set up dispute handling

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- Supabase Documentation: https://supabase.com/docs
- Check application logs for detailed error messages




