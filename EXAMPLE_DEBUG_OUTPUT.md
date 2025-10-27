# Example Debug Output

When you generate a payment link, the Edge Function will output detailed debug information in the Supabase logs.

## Sample Console Output

```
=== 2Checkout Payment URL Generated ===
Invoice ID: 550e8400-e29b-41d4-a716-446655440000
Products: [
  {
    "name": "Custom Design - Order #1234",
    "price": 15.5,
    "quantity": 1
  },
  {
    "name": "Logo Design - Order #1235",
    "price": 25,
    "quantity": 2
  }
]
Currency: USD
Total: 65.50
Seller ID: 254923900946
String to Sign: &Ksdf4F7&7zuQ7@$B%!z&6Gc5yuAA5Vq6yAfCgX#k7ffA8*Hz5B&h8JzWc7Yv-9s254923900946USD65.50
Generated Signature: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
Final URL: https://secure.2checkout.com/order/checkout.php?merchant=254923900946&dynamic=1&src=DYNAMIC&currency=USD&return-url=https%3A%2F%2Fyoursite.com%2Fpayment%2Fsuccess&return-type=redirect&cancel-url=https%3A%2F%2Fyoursite.com%2Fpayment%2Ffailure&merchant-order-id=550e8400-e29b-41d4-a716-446655440000&signature=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456&prod=Custom+Design+-+Order+%231234&price=15.50&qty=1&type=PRODUCT&prod_1=Logo+Design+-+Order+%231235&price_1=25.00&qty_1=2&type_1=PRODUCT
=== End Debug Info ===
```

## How to View These Logs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions**
4. Click on **generate-2co-payment-url**
5. Click the **Logs** tab
6. Generate an invoice in your Admin Dashboard
7. Watch the logs appear in real-time

## What to Check

### ✓ Correct Values

- **Total**: Should equal sum of (price × quantity) for all products
- **String to Sign**: Should be formatted as `secretWord + sellerId + currency + total`
- **Signature**: Should be a 64-character hexadecimal string (SHA256 hash)
- **Final URL**: Should include all products with `prod`, `price`, `qty`, `type` parameters

### ✗ Common Issues

**Issue: "2Checkout credentials not configured"**
- **Cause**: Secrets not set in Supabase
- **Fix**: Add `TCO_SELLER_ID` and `TCO_SECRET_WORD` in Supabase Dashboard → Project Settings → Edge Functions → Secrets

**Issue: Empty cart on 2Checkout page**
- **Cause**: Wrong signature (this was the original problem, now fixed)
- **Check**: Verify "String to Sign" follows format: `secretWord + sellerId + currency + total`
- **Verify**: The `secretWord` matches your 2Checkout dashboard exactly

**Issue: Signature appears wrong**
- **Cause**: Secret word doesn't match 2Checkout
- **Fix**: Copy the secret word directly from 2Checkout Dashboard → Integrations → Webhooks & API → Secret Word
- **Note**: Special characters like `&`, `!`, `@`, `#` are valid and should be included exactly as shown

## Testing with Different Scenarios

### Single Product
```
Products: [{ name: "Design Service", price: 50.00, quantity: 1 }]
Total: 50.00
String to Sign: <secretWord><sellerId>USD50.00
```

### Multiple Products
```
Products: [
  { name: "Service A", price: 10.00, quantity: 2 },
  { name: "Service B", price: 30.00, quantity: 1 }
]
Total: 50.00  (10*2 + 30*1)
String to Sign: <secretWord><sellerId>USD50.00
```

### Different Currency
```
Products: [{ name: "Design Service", price: 40.00, quantity: 1 }]
Currency: EUR
Total: 40.00
String to Sign: <secretWord><sellerId>EUR40.00
```

## Signature Verification Tool (Manual)

If you want to manually verify signatures, use this formula:

```javascript
import CryptoJS from "crypto-js";

const secretWord = "YOUR_SECRET_WORD";
const sellerId = "254923900946";
const currency = "USD";
const total = "50.00";

const toSign = `${secretWord}${sellerId}${currency}${total}`;
const signature = CryptoJS.SHA256(toSign).toString();

console.log("String to Sign:", toSign);
console.log("Signature:", signature);
```

Then compare this signature with what's in the Edge Function logs. They should match exactly.
