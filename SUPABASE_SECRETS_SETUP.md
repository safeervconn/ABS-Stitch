# Supabase Secrets Configuration

## Required Secrets for 2Checkout Integration

To complete the 2Checkout payment integration setup, you need to configure the following secrets in your Supabase project.

### How to Add Secrets

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings → Edge Functions → Secrets**
4. Add each secret below

---

## Secrets to Configure

### 1. TCO_SELLER_ID
- **Description**: Your 2Checkout Seller ID (also called Merchant Code)
- **Current Value**: `254923900946` (from your old .env file)
- **Used by**: `generate-2co-payment-url` Edge Function
- **Where to find**: 2Checkout Dashboard → Account Settings → Site Management

### 2. TCO_SECRET_WORD
- **Description**: Secret word used for signing dynamic product payment URLs (SHA256)
- **Current Value**: `&Ksdf4F7&7zuQ7@$B%!z&6Gc5yuAA5Vq6yAfCgX#k7ffA8*Hz5B&h8JzWc7Yv-9s`
- **Used by**: `generate-2co-payment-url` Edge Function
- **Where to find**: 2Checkout Dashboard → Integrations → Webhooks & API → Secret Word

### 3. TCO_INS_SECRET_WORD
- **Description**: Secret word used for verifying Instant Payment Notification (IPN) webhooks
- **Current Value**: `?Ly]vI4gJz7m1tnq6*E[`
- **Used by**: `handle-2co-webhook` Edge Function
- **Where to find**: 2Checkout Dashboard → Integrations → Webhooks & API → Secret Word

---

## Why Secrets Were Moved

Previously, these credentials were stored in the `.env` file with the `VITE_` prefix, which made them:
- ❌ Accessible in frontend JavaScript (visible in browser DevTools)
- ❌ Exposed in the compiled bundle
- ❌ A serious security risk

Now, they are:
- ✅ Stored securely in Supabase
- ✅ Only accessible by Edge Functions (server-side)
- ✅ Never exposed to the frontend
- ✅ Protected by Supabase's infrastructure

---

## Verification

After adding all three secrets:

1. **Test the payment URL generation**:
   - Go to Admin Dashboard → Invoice Management
   - Generate a new invoice
   - Check that the payment link is created successfully
   - Open the link and verify the checkout page displays correctly

2. **Check Edge Function logs**:
   - Go to Supabase Dashboard → Edge Functions
   - Select `generate-2co-payment-url`
   - View the Logs tab
   - You should see debug output showing the signature generation process

3. **Test the webhook**:
   - Make a test payment in 2Checkout sandbox mode
   - Check that the invoice status updates to "paid"
   - Verify the webhook logs in `handle-2co-webhook`

---

## Security Notes

- **Never commit secrets to git** - they are now removed from `.env`
- **Use different secrets for production and testing** - 2Checkout provides separate credentials for sandbox/test mode
- **Rotate secrets periodically** - especially if they may have been exposed
- **Keep the old .env values as backup** - until you've confirmed everything works with the new setup

---

## Troubleshooting

### "2Checkout credentials not configured" error

This means the secrets are not set in Supabase. Double-check:
1. All three secrets are added in Supabase Dashboard
2. Secret names match exactly (case-sensitive)
3. No extra spaces or quotes in the secret values

### Payment link shows "Empty Cart"

This was fixed by using the correct dynamic product signature algorithm:
- Formula: `SHA256(secretWord + sellerId + currency + total)`
- No parameter sorting or length-prefixing for dynamic products

If it still happens:
1. Check the Edge Function logs for the generated signature and toSign string
2. Verify `TCO_SECRET_WORD` matches what's in your 2Checkout dashboard
3. Ensure you're using the correct seller ID
4. Verify the total amount calculation is correct

### Webhook signature verification fails

1. Verify `TCO_INS_SECRET_WORD` matches your 2Checkout dashboard
2. Check the webhook URL is correctly configured in 2Checkout
3. Review the webhook logs for detailed error messages

---

## Next Steps

1. **Add all three secrets to Supabase**
2. **Test payment generation in the admin dashboard**
3. **Configure the webhook URL in 2Checkout** (see PAYMENT_INTEGRATION_GUIDE.md)
4. **Make a test payment** to verify end-to-end flow
5. **Remove the old VITE_2CO_* entries from .env** (already done ✓)
