# Stripe Escrow Setup - Quick Guide

## What You Need to Know

### The Escrow Flow:
```
Client Pays → Money in YOUR Stripe Account → Project Complete → Transfer to Provider
```

## Stripe Dashboard Setup (5 minutes)

### Step 1: Verify Your Stripe Account
1. Go to https://dashboard.stripe.com
2. Make sure your account is **activated**
3. Check that you have a **bank account** connected (to receive funds)

### Step 2: Enable Transfers (If Not Already Enabled)
1. Go to **Settings** → **Account** → **Transfers**
2. Make sure transfers are enabled
3. This allows you to send money to provider accounts

### Step 3: Test Mode Setup
1. Make sure you're using **test mode** for development
2. Test keys should start with `pk_test_` and `sk_test_`
3. Use test cards (see `STRIPE_TEST_CARDS.md`)

## How It Works Right Now

### Current Flow:
1. **Client pays** → Money goes to **YOUR Stripe account**
2. **Status in database**: `held` (escrow)
3. **Client completes project** → System tries to transfer to provider
4. **If provider has Stripe account**: Transfer succeeds ✅
5. **If provider doesn't have account**: Transfer fails, but payment marked as `released` in database

### What This Means:
- ✅ **Escrow is working** - funds are held
- ✅ **Automatic release works** - triggers when project is completed
- ⚠️ **Actual transfer requires** provider to have Stripe account connected

## For Production (Stripe Connect)

### What is Stripe Connect?
Allows providers to connect their own Stripe accounts to receive payments directly.

### Setup Steps:

1. **Enable Stripe Connect:**
   - Dashboard → Settings → Connect
   - Click "Get started"
   - Choose "Express accounts"

2. **Configure Connect:**
   - Set your platform name
   - Configure fees (your platform fee)
   - Set payout schedule

3. **Add to Your App (Future):**
   - Add "Connect Stripe Account" button for providers
   - Store provider's `stripe_account_id` in database
   - System will automatically use this for transfers

## Testing Checklist

### ✅ Test Payment Goes to Escrow:
- [ ] Accept proposal and pay
- [ ] Check database: `status = 'held'`
- [ ] Check Stripe Dashboard: Payment succeeded, money in your account

### ✅ Test Escrow Release:
- [ ] Complete the project
- [ ] Check database: `status = 'released'`
- [ ] Check Stripe Dashboard: Transfer created (if provider has account)

### ✅ Verify in Stripe:
- [ ] Go to Payments → See the payment
- [ ] Go to Transfers → See the transfer (if provider connected)
- [ ] Check Balance → Money moved from your account

## Important Notes

1. **No Action Required Now**: The system works as-is. You can test it immediately.

2. **Provider Accounts**: For providers to receive funds automatically, they need to connect Stripe accounts. Without this, you'll need to manually pay them.

3. **Your Stripe Account**: All payments go to YOUR account first, then you transfer to providers. This is the escrow mechanism.

4. **Database Tracking**: Even if Stripe transfer fails, the database tracks that escrow was released. You can manually pay providers based on this.

## Quick Test

1. **Accept a proposal** → Pay with test card
2. **Check Stripe Dashboard** → See payment in your account
3. **Complete the project** → System tries to transfer
4. **Check database** → Payment status = `released`

That's it! The escrow system is working. The only thing needed for full automation is Stripe Connect for providers.

