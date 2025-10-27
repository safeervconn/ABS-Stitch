# 2Checkout Webhook Integration - Fixed

## Problem Identified

The webhook function was failing with a 500 error because:

1. **Wrong Environment Variable Names**: The function was looking for `VITE_2CO_INS_SECRET_WORD` instead of reading from Supabase Secrets
2. **Missing Configuration**: 2Checkout credentials were not stored as Supabase Secrets
3. **Poor Error Handling**: The function wasn't properly handling test/verification requests from 2Checkout

## Solution Implemented

### 1. Updated Webhook Function

The `handle-2co-webhook` edge function now:
- Reads credentials from Supabase Secrets using `TCO_INS_SECRET_WORD` (not VITE_ prefix)
- Returns 200 OK for empty test requests from 2Checkout
- Provides detailed logging for debugging
- Handles multiple content types (form-data, JSON, URL-encoded)

### 2. Required Supabase Secrets

You need to configure the following secrets in Supabase:

```bash
# Set your 2Checkout INS Secret Word
supabase secrets set TCO_INS_SECRET_WORD="your_ins_secret_word_here"

# Optional: Set other 2Checkout credentials if needed by other functions
supabase secrets set TCO_MERCHANT_CODE="your_merchant_code"
supabase secrets set TCO_SECRET_KEY="your_secret_key"
supabase secrets set TCO_BUY_LINK_SECRET="your_buy_link_secret"
```

**Important**: These secrets are stored securely in Supabase and are only accessible by Edge Functions. They are NOT stored in `.env` files.

### 3. How to Set Secrets

#### Option A: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions**
3. Click on **Secrets** tab
4. Add each secret with its name and value

#### Option B: Via Supabase CLI
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref iutxllhudjckcaiwabud

# Set secrets
supabase secrets set TCO_INS_SECRET_WORD="your_ins_secret_word_here"
```

### 4. Where to Find Your 2Checkout Credentials

1. **INS Secret Word**:
   - Login to your 2Checkout account
   - Go to **Integrations** > **Webhooks & API** > **INS Settings**
   - Copy your Secret Word

2. **Merchant Code**:
   - Found in your 2Checkout account settings
   - Usually visible in the account dashboard

3. **Secret Key**:
   - Go to **Integrations** > **Webhooks & API**
   - Copy your API Secret Key

4. **Buy Link Secret**:
   - Go to **Integrations** > **Webhooks & API** > **Buy Link Secret**
   - Copy your Buy Link Secret

### 5. Configure Webhook URL in 2Checkout

Once secrets are set, configure the webhook URL in 2Checkout:

1. Login to 2Checkout
2. Go to **Integrations** > **Webhooks & API** > **INS Settings**
3. Set the webhook URL to:
   ```
   https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
   ```
4. Enable the webhook
5. Click **Test** to verify it works

### 6. Expected Response

When 2Checkout tests your webhook URL, you should now see:

```json
{
  "status": "ok",
  "message": "2Checkout webhook endpoint is ready",
  "timestamp": "2025-10-27T12:00:00.000Z"
}
```

## Testing the Integration

### Test 1: GET Request (Health Check)
```bash
curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
```

Expected response:
```json
{
  "message": "2Checkout IPN endpoint is active",
  "status": "ready"
}
```

### Test 2: Empty POST (2CO Verification)
```bash
curl -X POST https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "status": "ok",
  "message": "2Checkout webhook endpoint is ready",
  "timestamp": "..."
}
```

## Webhook Flow

1. Customer completes payment on 2Checkout
2. 2Checkout sends IPN notification to webhook URL
3. Webhook function:
   - Verifies signature using INS Secret Word
   - Validates payment amount matches invoice
   - Updates invoice status to "paid"
   - Copies stock design files (if applicable)
   - Updates order payment status
4. Customer receives access to purchased files

## Security Notes

- **Never** commit secrets to Git or store in `.env` files
- **Always** use Supabase Secrets for sensitive credentials
- The webhook URL is public but secured by signature verification
- Only Edge Functions can access Supabase Secrets
- Frontend code cannot access these secrets

## Troubleshooting

### Issue: "INS_SECRET_WORD not configured"
**Solution**: Set the `TCO_INS_SECRET_WORD` secret in Supabase

### Issue: "Signature verification failed"
**Solution**: Verify your INS Secret Word matches exactly with 2Checkout settings

### Issue: "Invoice not found"
**Solution**: Ensure invoice was created before payment and merchant-order-id matches invoice ID

### Issue: Still getting 500 error
**Solution**:
1. Check Supabase Edge Function logs for detailed error messages
2. Verify all secrets are set correctly
3. Test with curl commands above

## Next Steps

1. Set all required Supabase Secrets
2. Test webhook URL using 2Checkout dashboard
3. Create a test invoice and complete a test payment
4. Monitor logs to verify webhook processes successfully
