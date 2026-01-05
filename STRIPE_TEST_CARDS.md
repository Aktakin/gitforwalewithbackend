# 💳 Stripe Test Cards

Use these test card numbers when testing payments in **Stripe Test Mode**.

## ✅ Success Cards (Recommended)

### Visa - Success
```
Card Number: 4242 4242 4242 4242
Expiry Date: Any future date (e.g., 12/25 or 12/2025)
CVC: Any 3 digits (e.g., 123)
Postal Code: Any 5 digits (e.g., 12345)
```

### Mastercard - Success
```
Card Number: 5555 5555 5555 4444
Expiry Date: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Postal Code: Any 5 digits (e.g., 12345)
```

### Visa - Success (Alternative)
```
Card Number: 4000 0566 5566 5556
Expiry Date: Any future date
CVC: Any 3 digits
Postal Code: Any 5 digits
```

## ❌ Declined Cards (For Testing Errors)

### Card Declined
```
Card Number: 4000 0000 0000 0002
Expiry Date: Any future date
CVC: Any 3 digits
Postal Code: Any 5 digits
```

### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry Date: Any future date
CVC: Any 3 digits
Postal Code: Any 5 digits
```

## 🔐 Requires Authentication (3D Secure)

### Requires Authentication
```
Card Number: 4000 0027 6000 3184
Expiry Date: Any future date
CVC: Any 3 digits
Postal Code: Any 5 digits
```

When you use this card, Stripe will show a 3D Secure authentication popup. Click "Complete authentication" to proceed.

## 📝 Quick Reference

**Most Common Test Card:**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** `12/25` (or any future date)
- **CVC:** `123` (or any 3 digits)
- **Postal Code:** `12345` (or any 5 digits)

## ⚠️ Important Notes

1. **Only works in Test Mode** - These cards only work when using Stripe test keys (`pk_test_...` and `sk_test_...`)

2. **No real charges** - These are test cards, so no real money will be charged

3. **Any future expiry** - The expiry date can be any date in the future (e.g., 12/25, 01/26, etc.)

4. **Any CVC** - The CVC (3-digit security code) can be any 3 digits

5. **Any postal code** - The postal/zip code can be any valid format (e.g., 12345, 90210, etc.)

## 🧪 Testing Different Scenarios

### Test Successful Payment
- Use: `4242 4242 4242 4242`
- Result: Payment succeeds immediately

### Test Declined Payment
- Use: `4000 0000 0000 0002`
- Result: Payment is declined

### Test 3D Secure
- Use: `4000 0027 6000 3184`
- Result: Shows authentication popup

## 🔗 More Test Cards

For a complete list of Stripe test cards, visit:
https://stripe.com/docs/testing

---

**Remember:** These cards only work with Stripe test keys. For production, you'll need real card numbers from actual users.

