# 2Checkout Integration - Quick Start

## ⚡ 3-Step Setup (5 minutes)

### Step 1: Set Supabase Secrets

```bash
# Run the automated setup script
./setup-2checkout-secrets.sh
```

Or manually:

```bash
supabase secrets set TCO_INS_SECRET_WORD="your_ins_secret_word"
supabase secrets set TCO_MERCHANT_CODE="your_merchant_code"
supabase secrets set TCO_BUY_LINK_SECRET="your_buy_link_secret"
```

**Where to find these values**: 2Checkout Dashboard → Integrations → Webhooks & API

### Step 2: Configure 2Checkout Webhook

1. Go to: 2Checkout Dashboard → Integrations → Webhooks & API → INS Settings
2. Set webhook URL:
   ```
   https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
   ```
3. Click **Test** (should return success)
4. Save

### Step 3: Test

```bash
# Test webhook
curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook

# Should return:
# {"message":"2Checkout IPN endpoint is active","status":"ready"}
```

---

## 🎯 What Was Fixed

**Problem**: Webhook returned 500 error when 2Checkout tried to verify the URL

**Solution**:
- Updated Edge Function to read from Supabase Secrets (not .env)
- Added proper handling for 2Checkout test requests
- Deployed both webhook and invoice generation functions

**Status**: ✅ Functions deployed, waiting for secrets configuration

---

## 📋 Required Credentials

| Secret Name | Where to Find | Purpose |
|-------------|---------------|---------|
| `TCO_INS_SECRET_WORD` | 2CO → Integrations → Webhooks & API → INS Settings | Verify webhooks |
| `TCO_MERCHANT_CODE` | 2CO → Account Settings | Generate payment links |
| `TCO_BUY_LINK_SECRET` | 2CO → Integrations → Webhooks & API → Buy Link Secret | Sign payment URLs |

---

## 🚀 Usage

### Generate Invoice (Admin Dashboard)

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/generate-invoice`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderIds: ['uuid1', 'uuid2'],
      customerId: 'customer-uuid',
      returnUrl: 'https://yourapp.com/payment/success',
      cancelUrl: 'https://yourapp.com/payment/cancelled',
    }),
  }
);
```

---

## 🔍 Testing

### Test Card Numbers

- **Success**: 4111111111111111
- **Failure**: 4000000000000002
- Expiry: Any future date
- CVV: Any 3 digits

### View Logs

```bash
supabase functions logs handle-2co-webhook --follow
```

---

## 📚 Full Documentation

- **WEBHOOK_FIX_SUMMARY.md** - What was fixed and why
- **2CO_COMPLETE_GUIDE.md** - Complete integration guide
- **2CO_WEBHOOK_FIX.md** - Detailed technical documentation

---

## ✅ Checklist

- [ ] Set all 3 Supabase Secrets
- [ ] Configure webhook URL in 2Checkout
- [ ] Test webhook endpoint responds
- [ ] Generate test invoice
- [ ] Complete test payment
- [ ] Verify invoice updates to "paid"
- [ ] Verify order updates to "paid"
- [ ] Check logs for any errors

---

**Need Help?** Check the logs: `supabase functions logs handle-2co-webhook`
