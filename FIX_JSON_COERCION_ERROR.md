# Fix for JSON Coercion Error

## Problem
Error: "Cannot coerce the result to a single JSON object"

This error occurs when using `.single()` on Supabase queries that involve complex joins or when the database structure causes coercion issues.

## Root Cause
The error was caused by using joins like `select('*, users(*)')` or `select('*, requests(*)')` in the following functions:
- `db.proposals.getByRequest()`
- `db.proposals.getUserProposals()`
- `db.proposals.create()`

When Supabase tries to join tables and coerce the result into a single JSON object, it can fail if:
1. The join returns multiple rows unexpectedly
2. The schema has foreign key relationships that create ambiguity
3. There are null values or missing relationships

## Solution
**Fetch related data separately instead of using joins.**

### Before (Problematic Code):
```javascript
getByRequest: async (requestId) => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, users(*)')  // ❌ Join can cause coercion issues
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### After (Fixed Code):
```javascript
getByRequest: async (requestId) => {
  // Fetch proposals without joins
  const { data, error } = await supabase
    .from('proposals')
    .select('*')  // ✅ No join
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Fetch user data separately for each proposal
  if (data && data.length > 0) {
    const proposalsWithUsers = await Promise.all(
      data.map(async (proposal) => {
        let userData = null;
        if (proposal.user_id) {
          try {
            const { data: user } = await supabase
              .from('users')
              .select('*')
              .eq('id', proposal.user_id)
              .maybeSingle();  // ✅ Use maybeSingle() for safety
            userData = user;
          } catch (err) {
            console.warn('Error fetching user for proposal:', err);
          }
        }
        return {
          ...proposal,
          users: userData,
          user: userData
        };
      })
    );
    return proposalsWithUsers;
  }
  
  return data;
}
```

## Changes Made

### Web App (`src/lib/supabase.js`)

**Proposals:**
1. **`db.proposals.getByRequest()`** - Removed `users(*)` join, fetch users separately
2. **`db.proposals.getUserProposals()`** - Removed `requests(*)` join, fetch requests separately

**Skills:**
3. **`db.skills.getPublicSkills()`** - Removed `users(*)` join, fetch users separately

**Requests:**
4. **`db.requests.getAll()`** - Removed `users(*)` join, fetch users separately

**Messages:**
5. **`db.messages.getConversation()`** - Removed `sender:users(*)` join, fetch senders separately
6. **`db.messages.send()`** - Removed `sender:users(*)` join, fetch sender separately

**Conversations:**
7. **`db.conversations.getUserConversations()`** - Removed complex joins `user1:users(*), user2:users(*), requests(*)`, fetch all separately

**Payments:**
8. **`db.payments.getByProposal()`** - Removed nested joins `proposals(*, requests(*), users(*))`, fetch all separately
9. **`db.payments.getUserPayments()`** - Removed nested joins, fetch related data separately for each payment
10. **`db.payments.update()`** - Removed nested joins, fetch related data separately

**Transactions:**
11. **`db.transactions.getByPayment()`** - Removed `users(*)` join, fetch users separately
12. **`db.transactions.getUserTransactions()`** - Removed nested joins `payments(*, proposals(*, requests(*)))`, fetch all separately

### Mobile App (`SkillBApp/src/lib/supabase.js`)
1. **`db.proposals.getByRequest()`** - Removed `users(*)` join, fetch users separately
2. **`db.proposals.getUserProposals()`** - Removed `requests(*)` join, fetch requests separately
3. **`db.proposals.create()`** - Removed `users(*), requests(*)` joins, fetch related data separately

## Benefits
- ✅ Eliminates JSON coercion errors
- ✅ More predictable behavior
- ✅ Better error handling (individual try-catch for each related fetch)
- ✅ Works with complex database schemas
- ✅ Uses `maybeSingle()` instead of `.single()` for safety

## Testing
After applying these fixes:
1. Navigate to `/requests/:id/proposal` - should load without errors
2. View proposals page - should display all proposals correctly
3. Accept/decline proposals - should update status correctly
4. Create new proposal - should submit without errors

## Database Consideration
If you want to improve the RLS policy for proposal updates, run the SQL script:
```bash
fix-proposal-decline.sql
```

This ensures request owners can update (accept/reject) proposals submitted for their requests.

## Notes
- This pattern should be applied to ANY Supabase query that uses joins with `.single()`
- Always use `maybeSingle()` instead of `.single()` when a record might not exist
- For queries that should return exactly one result, fetch without joins then add a check

