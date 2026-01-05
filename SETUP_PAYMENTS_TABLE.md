# 🔧 Fix "Could not find the table 'public.payments'" Error

## Problem
You're getting an error: **"Could not find the table 'public.payments' in the schema cache"**

This means the `payments` table doesn't exist in your Supabase database yet.

## Solution

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Payments Table SQL

1. Open the file `CREATE_PAYMENTS_TABLE.sql` in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Table Was Created

After running the SQL, you should see:
- ✅ Success message: "Payments table created successfully!"
- The table should appear in the **Table Editor** under `payments`

### Step 4: Test the Payment Again

1. Go back to your app
2. Try accepting a proposal and making a payment
3. The error should be gone!

## What This Creates

The SQL script creates:
- ✅ `payments` table with all required columns
- ✅ Indexes for better performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic `updated_at` timestamp trigger

## Required Columns

The table includes:
- `id` - Primary key
- `user_id` - Who made the payment
- `request_id` - Which request the payment is for
- `proposal_id` - Which proposal the payment is for
- `amount` - Payment amount
- `status` - Payment status (pending, succeeded, failed, etc.)
- `payment_intent_id` - Stripe payment intent ID
- `platform_fee`, `processing_fee`, `net_amount` - Fee breakdown
- And more...

## Troubleshooting

### "relation already exists"
- The table already exists
- You can either:
  - Drop it first: `DROP TABLE IF EXISTS public.payments CASCADE;`
  - Or just skip this step

### "permission denied"
- Make sure you're running this as a database admin
- Check your Supabase project permissions

### Still getting errors?
- Check the browser console for the exact error message
- Verify the table exists in Supabase Table Editor
- Make sure RLS policies are enabled

## Next Steps

After creating the table:
1. ✅ Test a payment in your app
2. ✅ Check that payments are being saved to the database
3. ✅ Verify Stripe integration is working

