# 2Checkout Webhook Integration - Fix Summary

## Problem

Your 2Checkout webhook was returning a **500 Internal Server Error** when 2Checkout tried to verify the endpoint. The error occurred because:

1. The Edge Function was looking for credentials in the wrong place (`VITE_2CO_INS_SECRET_WORD` instead of Supabase Secrets)
2. The function wasn't handling empty test/verification requests from 2Checkout properly
3. Credentials were not configured as Supabase Secrets

## Solution

### 1. Fixed Webhook Edge Function

**File**: `supabase/functions/handle-2co-webhook/index.ts`

**Changes**:
- Changed to read from `TCO_INS_SECRET_WORD` (Supabase Secret) instead of `VITE_2CO_INS_SECRET_WORD`
- Added proper handling for empty POST requests (2Checkout verification)
- Enhanced logging for debugging
- Better error responses that comply with 2Checkout requirements

### 2. Created Invoice Generation Edge Function

**File**: `supabase/functions/generate-invoice/index.ts`

**Purpose**: Generate invoices and 2Checkout payment links from admin dashboard

**Features**:
- Admin-only access (role verification)
- Creates invoice in database
- Generates signed 2Checkout payment link
- Links orders to invoice
- Updates order payment status
- Sends customer notification

### 3. Deployed Both Functions

Both Edge Functions are now deployed and active:
- `handle-2co-webhook` - Processes IPN notifications
- `generate-invoice` - Creates invoices and payment links

## What You Need to Do

### Step 1: Configure Supabase Secrets

You must set the following secrets in Supabase (NOT in .env file):

```bash
# Option 1: Use the setup script
chmod +x setup-2checkout-secrets.sh
./setup-2checkout-secrets.sh

# Option 2: Set manually via CLI
supabase secrets set TCO_INS_SECRET_WORD="your_ins_secret_word"
supabase secrets set TCO_MERCHANT_CODE="your_merchant_code"
supabase secrets set TCO_BUY_LINK_SECRET="your_buy_link_secret"
```

**Where to find these values**:
- Login to 2Checkout Dashboard
- Go to **Integrations** → **Webhooks & API**
- Copy each value and set as Supabase Secret

### Step 2: Configure Webhook in 2Checkout

1. Login to 2Checkout Dashboard
2. Go to **Integrations** → **Webhooks & API** → **INS Settings**
3. Set webhook URL to:
   ```
   https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
   ```
4. Click **Test** - should now return success
5. Save settings

### Step 3: Test the Integration

```bash
# Test webhook health
curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook

# Expected response:
# {"message":"2Checkout IPN endpoint is active","status":"ready"}
```

## Files Created/Modified

### Created:
- ✅ `supabase/functions/generate-invoice/index.ts` - Invoice generation Edge Function
- ✅ `2CO_WEBHOOK_FIX.md` - Detailed fix documentation
- ✅ `2CO_COMPLETE_GUIDE.md` - Complete integration guide
- ✅ `setup-2checkout-secrets.sh` - Interactive setup script
- ✅ `WEBHOOK_FIX_SUMMARY.md` - This summary

### Modified:
- ✅ `supabase/functions/handle-2co-webhook/index.ts` - Fixed credential loading and test request handling

## Expected Behavior

### Before Fix:
```
2Checkout Test → 500 Internal Server Error
Error: Cannot set URL for IPN
```

### After Fix (Once Secrets Are Set):
```
2Checkout Test → 200 OK
Response: {"status":"ok","message":"2Checkout webhook endpoint is ready"}
```

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin generates invoice for customer orders              │
│    → Calls generate-invoice Edge Function                   │
│    → Creates invoice + 2Checkout payment link               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Customer clicks payment link                             │
│    → Redirects to 2Checkout hosted checkout                 │
│    → Customer completes payment                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 2Checkout sends IPN notification                         │
│    → handle-2co-webhook Edge Function receives POST         │
│    → Verifies signature                                     │
│    → Updates invoice status to "paid"                       │
│    → Updates order payment status                           │
│    → Copies stock design files (if applicable)              │
│    → Customer gets access to purchased files                │
└─────────────────────────────────────────────────────────────┘
```

## Security Notes

✅ **Credentials stored securely** in Supabase Secrets (not in .env)
✅ **Webhook signatures verified** using MD5 hash with INS Secret Word
✅ **Payment amounts validated** to prevent fraud
✅ **Admin-only access** for invoice generation
✅ **Public webhook secured** by signature verification

## Next Steps

1. **Set Supabase Secrets** (required - see Step 1 above)
2. **Configure webhook URL** in 2Checkout (see Step 2 above)
3. **Test the integration** (see Step 3 above)
4. **Generate test invoice** from admin dashboard
5. **Complete test payment** with 2Checkout test card
6. **Monitor logs** to verify webhook processes successfully

## Troubleshooting

If you still see errors after setting secrets:

1. Verify secrets are set correctly:
   ```bash
   supabase secrets list
   ```

2. Check Edge Function logs:
   ```bash
   supabase functions logs handle-2co-webhook
   ```

3. Test webhook endpoint:
   ```bash
   curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
   ```

## Documentation

For complete details, see:
- **2CO_WEBHOOK_FIX.md** - Detailed technical fix
- **2CO_COMPLETE_GUIDE.md** - Complete integration guide
- **setup-2checkout-secrets.sh** - Automated setup script

## Support

If you need help:
1. Check logs: `supabase functions logs handle-2co-webhook`
2. Review error messages in 2Checkout dashboard
3. Verify all secrets are set correctly
4. Test with curl commands provided above

---

**Status**: ✅ Edge Functions deployed and ready
**Action Required**: Configure Supabase Secrets
**Estimated Time**: 5 minutes
