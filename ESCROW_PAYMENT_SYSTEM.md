# Escrow Payment System Implementation

## Overview
This system implements an escrow payment flow where:
1. **Client pays** → Money goes to Stripe (held by platform)
2. **Funds held in escrow** → Status: `held` (not released to provider)
3. **Client marks job complete** → Funds automatically released to provider via Stripe Transfer

## Payment Flow

### Step 1: Client Accepts Proposal & Pays
1. Client clicks "Accept Proposal"
2. Payment modal opens
3. Client enters payment details
4. Payment is processed via Stripe
5. **Payment status set to `held`** (not `succeeded`)
6. Funds are held in Stripe account (escrow)

### Step 2: Provider Works on Project
- Provider can see payment is "held in escrow"
- Provider completes the work
- Status remains `held` until client approves

### Step 3: Client Marks Project Complete
1. Client clicks "Complete" on the project
2. System automatically:
   - Updates request status to `completed`
   - Updates proposal status to `completed`
   - **Releases escrow funds to provider** via Stripe Transfer
   - Updates payment status to `released`

## Implementation Details

### Payment Creation
- **File**: `src/lib/paymentService.js`
- **Function**: `createProposalPayment()`
- **Changes**:
  - Sets `is_escrow: true` when creating payment
  - Stores `providerUserId` in metadata for later transfer

### Payment Status
- **Status Flow**: `pending` → `held` → `released`
- **NOT**: `pending` → `succeeded` → `released`
- Funds are held in escrow (status: `held`) until completion

### Escrow Release
- **File**: `src/lib/paymentService.js`
- **Function**: `releaseEscrow()`
- **Trigger**: Automatically called when project is marked complete
- **Process**:
  1. Finds payment by `proposal_id`
  2. Checks if status is `held` and `is_escrow` is true
  3. Creates Stripe Transfer to provider's connected account
  4. Updates payment status to `released`
  5. Creates transaction record

### Backend API
- **File**: `server/payment-api.js`
- **New Endpoint**: `POST /api/payments/transfer`
- **Purpose**: Securely transfer funds from platform to provider
- **Requires**: Provider's Stripe connected account ID

## Database Schema

The `payments` table includes:
- `is_escrow` (BOOLEAN) - Whether payment is held in escrow
- `status` (VARCHAR) - Payment status: `pending`, `held`, `released`, `succeeded`
- `escrow_released_at` (TIMESTAMP) - When funds were released
- `escrow_released_to` (UUID) - Provider user ID who received funds

## Stripe Setup Required

### For Providers (Future Enhancement)
Providers need to connect their Stripe account to receive transfers:
1. Provider goes to settings
2. Connects Stripe account (Stripe Connect)
3. System stores `stripe_account_id` in user profile
4. When funds are released, transfer goes to this account

### Current Implementation
- If provider doesn't have connected account, payment is marked as `released` in database
- But no actual Stripe transfer is made
- Provider needs to connect account to receive funds

## Testing the Flow

1. **Accept Proposal & Pay**:
   - Go to proposals page
   - Accept a proposal
   - Complete payment
   - Check payment status in database → Should be `held`

2. **Complete Project**:
   - Go to Client Dashboard
   - Find the active project
   - Click "Complete"
   - Check payment status → Should change to `released`
   - Check Stripe dashboard → Transfer should be created (if provider has connected account)

## Manual Escrow Release (Fallback)

If automatic release fails, you can manually release:
- Go to payment page
- Click "Release Escrow Funds" button
- Funds will be transferred to provider

## Important Notes

1. **Stripe Transfers require connected accounts**: For providers to receive funds, they need to connect their Stripe account. Without this, funds stay in platform account.

2. **Escrow is automatic**: Once a project is marked complete, escrow is automatically released. No manual intervention needed.

3. **Payment status**: Always check `status === 'held'` to see if funds are in escrow.

4. **Error handling**: If escrow release fails, the project completion still succeeds. Funds can be released manually later.

## Next Steps (Optional Enhancements)

1. **Stripe Connect Integration**: Allow providers to connect their Stripe accounts
2. **Email Notifications**: Notify provider when funds are released
3. **Escrow Dashboard**: Show all held payments and release status
4. **Dispute Resolution**: Handle cases where client/provider disagree on completion

