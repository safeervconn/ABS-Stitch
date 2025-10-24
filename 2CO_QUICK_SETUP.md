# 2Checkout Quick Setup Reference

## 🔑 Your Credentials

```
Merchant Code: 254923900946
Secret Key: ?Ly]vI4gJz7m1tnq6*E[
INS Secret Word: ?Ly]vI4gJz7m1tnq6*E[
Buy Link Secret: &Ksdf4F7&7zuQ7@$B%!z&6Gc5yuAA5Vq6yAfCgX#k7ffA8*Hz5B&h8JzWc7Yv-9s
Publishable Key: B6153B25-7CCA-4069-B161-F3476A9A0536
```

## 🌐 Webhook URL

```
https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
```

## ⚡ Quick 5-Minute Setup

### Step 1: Configure 2Checkout IPN (2 minutes)
1. Login to 2Checkout: https://secure.2checkout.com/cpanel/
2. Go to: **Integrations → Webhooks & API → IPN Settings**
3. Enable IPN
4. Set IPN URL to: `https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook`
5. Go to: **Integrations → Webhooks & API → Secret word**
6. Set secret word: `?Ly]vI4gJz7m1tnq6*E[`
7. **Test the endpoint** - Should now return success (not "EMPTY RESPONSE")

### Step 2: Run Database Migration (1 minute)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/20251024104403_add_2checkout_payment_integration.sql`
3. Execute
4. Done!

### Step 3: Set Supabase Secrets (2 minutes)
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add secrets:
   - `VITE_2CO_INS_SECRET_WORD` = `?Ly]vI4gJz7m1tnq6*E[`
   - `VITE_2CO_SECRET_KEY` = `?Ly]vI4gJz7m1tnq6*E[`
3. Done!

## ✅ Verification Tests

### Test 1: Webhook Endpoint
```bash
curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
```
Expected: `{"message":"2Checkout IPN endpoint is active","status":"ready"}`

### Test 2: 2Checkout Dashboard Test
1. In 2CO dashboard, go to IPN Settings
2. Click "Test IPN"
3. Should return success (not "EMPTY RESPONSE")

### Test 3: Upload Stock Design
1. Login as admin
2. Go to Stock Designs
3. Add new design with ZIP file
4. Should upload successfully

### Test 4: Complete Purchase
1. Add stock design to cart
2. Checkout
3. Use 2Checkout test card
4. Verify payment completes
5. Check files available in dashboard

## 🔍 Troubleshooting

### Still Getting "EMPTY RESPONSE"?
- Wait 1-2 minutes after Edge Function deployment
- Clear browser cache
- Try the curl test above first
- Check Edge Function logs in Supabase

### Webhook Not Processing?
1. Check Edge Function logs
2. Verify INS secret word matches exactly
3. Test signature with sample payload

### Files Not Copying?
1. Verify stock design has attachment_url
2. Check Edge Function logs for errors
3. Verify storage bucket permissions

## 📊 What To Monitor

### In Supabase Dashboard:
- **Edge Functions → handle-2co-webhook → Logs**: Payment processing logs
- **Database → invoices**: Check tco_reference_number populated
- **Storage → stock-design-files**: Uploaded ZIP files
- **Storage → order-attachments**: Copied customer files

### In 2Checkout Dashboard:
- **Dashboard → Transactions**: Payment history
- **Integrations → IPN**: Notification delivery status

## 🎯 Success Indicators

✅ Webhook test returns success
✅ Stock designs can upload ZIP files
✅ Checkout redirects to 2Checkout
✅ Test payment completes
✅ Invoice updates to "paid"
✅ Files become available to customer
✅ Admin can copy/regenerate payment links

## 📞 Quick Links

- **2CO Dashboard**: https://secure.2checkout.com/cpanel/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/iutxllhudjckcaiwabud
- **Full Setup Guide**: See `2CO_SETUP_GUIDE.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Estimated Setup Time**: 5 minutes
**Difficulty**: Easy
**Status**: Ready to configure
