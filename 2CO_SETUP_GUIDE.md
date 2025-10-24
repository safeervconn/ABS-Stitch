# 2Checkout Payment Integration - Setup Guide

## Overview
This guide will help you complete the setup of 2Checkout payment integration for your application.

## ✅ Completed Tasks

1. **Environment Configuration**
   - Added 2Checkout credentials to `.env` file
   - All required environment variables are configured

2. **Database Schema**
   - Migration `20251024104403_add_2checkout_payment_integration.sql` is ready
   - Schema includes invoice_id, payment status, 2CO transaction fields, and attachment fields

3. **Storage Buckets**
   - Created `stock-design-files` bucket (private, ZIP files only, admin access)
   - Created `order-attachments` bucket (private, multi-format, role-based access)
   - RLS policies configured for secure access

4. **Edge Functions**
   - Deployed `handle-2co-webhook` - Webhook handler for payment notifications
   - Deployed `manage-stock-design-file` - Stock design file management
   - Environment variables configured automatically

5. **Frontend Features**
   - Enhanced InvoiceManagementTab with payment link actions
   - Added copy, open, regenerate payment link buttons
   - Added manual "Mark as Paid" functionality
   - Payment status displays with 2CO reference numbers

6. **Webhook Improvements**
   - Fixed "EMPTY RESPONSE" error with GET endpoint support
   - Added multi-format payload handling (form-data, JSON, URL-encoded)
   - Graceful handling of test requests from 2Checkout

## 🔧 Remaining Setup Steps

### Step 1: Configure 2Checkout Dashboard

1. **Log into 2Checkout Dashboard**: https://secure.2checkout.com/cpanel/

2. **Enable IPN (Instant Payment Notifications)**:
   - Navigate to: Integrations → Webhooks & API → IPN Settings
   - Enable IPN notifications
   - Set IPN URL to:
     ```
     https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
     ```

3. **Configure INS Secret Word**:
   - Go to: Integrations → Webhooks & API → Secret word
   - Set secret word to: `?Ly]vI4gJz7m1tnq6*E[`
   - Save changes

4. **Test the Endpoint**:
   - In 2Checkout dashboard, use the "Test IPN" button
   - You should now receive a success response (not "EMPTY RESPONSE")
   - Check the response shows: `{"message":"Endpoint is active and ready","status":"ready"}`

5. **Enable Notification Types**:
   - Enable all payment notifications:
     - ORDER_CREATED
     - PAYMENT_AUTHORIZED
     - COMPLETE
     - REFUND_ISSUED
     - FRAUD_STATUS_CHANGED

6. **Configure Return URLs** (optional - handled automatically in code):
   - Success URL: `https://your-domain.com/payment/success`
   - Cancel URL: `https://your-domain.com/payment/failure`

7. **Digital Goods Settings**:
   - Navigate to: Settings → General Settings
   - Enable "Digital goods" option
   - Set default currency to USD

8. **Test Mode**:
   - For initial testing, keep "Test mode" enabled
   - Use test card numbers from 2Checkout documentation
   - Switch to production mode when ready

### Step 2: Run Database Migration

The migration has already been created but needs to be applied:

```sql
-- Migration: 20251024104403_add_2checkout_payment_integration.sql
-- This adds invoice_id, payment statuses, 2CO fields, and triggers
```

To apply:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251024104403_add_2checkout_payment_integration.sql`
3. Execute the migration
4. Verify tables updated successfully

### Step 3: Set Environment Variables in Supabase

For Edge Functions to access 2CO credentials:

1. Go to: Supabase Dashboard → Edge Functions → Settings
2. Add these secrets:
   - `VITE_2CO_INS_SECRET_WORD` = `?Ly]vI4gJz7m1tnq6*E[`
   - `VITE_2CO_SECRET_KEY` = `?Ly]vI4gJz7m1tnq6*E[`

### Step 4: Test the Integration

#### Test 1: Test Webhook Endpoint
```bash
curl https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
```
Expected: `{"message":"2Checkout IPN endpoint is active","status":"ready"}`

#### Test 2: Create Stock Design with Attachment
1. Login as admin
2. Go to Admin Dashboard → Stock Designs
3. Add a new stock design
4. Upload a ZIP file attachment
5. Verify file is uploaded to `stock-design-files` bucket

#### Test 3: Stock Design Purchase Flow
1. Login as a customer
2. Add stock design to cart
3. Proceed to checkout
4. Complete payment with 2Checkout test card
5. Verify:
   - Orders created with `unpaid` status
   - Invoice created with payment link
   - Orders updated to `pending_payment`
   - After payment, orders updated to `paid`
   - Files copied to order-attachments
   - Customer can download files

#### Test 4: Custom Order Invoice
1. Login as admin
2. Go to Admin Dashboard → Invoices
3. Generate invoice for a customer
4. Select unpaid orders
5. Verify payment link is generated
6. Copy and test payment link
7. Complete test payment
8. Verify invoice status updates to `paid`

#### Test 5: Payment Link Management
1. Go to Admin Dashboard → Invoices
2. For unpaid invoices, verify you can:
   - Copy payment link
   - Open payment link in new tab
   - Regenerate payment link
   - Mark as paid manually

### Step 5: Monitor and Debug

#### View Webhook Logs
1. Go to: Supabase Dashboard → Edge Functions → handle-2co-webhook
2. Click "Logs" tab
3. Monitor incoming webhook requests
4. Check for any errors in signature verification

#### View Payment Processing
1. Check `invoices` table for:
   - `tco_reference_number` populated
   - `tco_order_id` populated
   - `tco_payment_method` populated
   - Status changed to `paid`

2. Check `orders` table for:
   - `payment_status` changed to `paid`
   - `invoice_id` populated correctly

3. Check `order_attachments` table for:
   - Files copied after payment
   - Correct file paths

## 📋 Quick Testing Checklist

- [ ] 2Checkout IPN URL configured and tested
- [ ] INS secret word matches in both systems
- [ ] Webhook endpoint returns 200 OK
- [ ] Database migration applied successfully
- [ ] Storage buckets created with correct policies
- [ ] Edge Functions deployed and accessible
- [ ] Stock design with ZIP file uploads successfully
- [ ] Checkout creates orders and invoice
- [ ] Payment link generates correctly
- [ ] Test payment completes successfully
- [ ] Webhook updates invoice to paid
- [ ] Files copy to order-attachments automatically
- [ ] Customer can download files after payment
- [ ] Admin can copy/regenerate payment links
- [ ] Admin can mark invoice as paid manually

## 🚨 Troubleshooting

### Webhook Returns "EMPTY RESPONSE"
**Fixed!** The webhook now handles GET requests and returns a proper response.

### Signature Verification Fails
- Verify INS secret word matches exactly in both systems
- Check webhook logs for received payload
- Ensure no extra whitespace in secret word

### Files Not Copying After Payment
- Check Edge Function logs for errors
- Verify source file exists in `stock-design-files`
- Verify target bucket `order-attachments` has correct permissions
- Check `attachment_url` field in `stock_designs` table

### Payment Link Not Working
- Verify all 2CO credentials are correct
- Check signature generation in browser console
- Test with 2Checkout's test card numbers
- Ensure merchant code is correct: 254923900946

### Orders Not Updating to Paid
- Check webhook is receiving notifications
- Verify invoice ID is passed correctly
- Check database triggers are working
- Review Edge Function logs for errors

## 🎯 Production Deployment Checklist

Before going live:

1. [ ] Switch 2Checkout from test mode to production mode
2. [ ] Update environment variables with production credentials
3. [ ] Test with real payment (small amount)
4. [ ] Verify webhook receives production notifications
5. [ ] Monitor first 10 transactions closely
6. [ ] Set up database backups
7. [ ] Configure monitoring alerts
8. [ ] Document any custom configurations
9. [ ] Train staff on invoice management
10. [ ] Prepare customer support documentation

## 📞 Support Resources

- **2Checkout Documentation**: https://knowledgecenter.2checkout.com/
- **2Checkout Support**: https://www.2checkout.com/contact/
- **IPN Documentation**: https://knowledgecenter.2checkout.com/Integrate/Payment-Notifications
- **Test Card Numbers**: https://knowledgecenter.2checkout.com/Integrate/Testing

## 🎉 Success Indicators

Your integration is working when:
1. ✅ Webhook endpoint returns success on 2CO test
2. ✅ Stock design checkout redirects to 2Checkout
3. ✅ Successful payment updates invoice status
4. ✅ Files automatically become available to customers
5. ✅ Admin can manage payment links
6. ✅ All payment statuses display correctly

---

**Implementation Date**: October 24, 2025
**Version**: 1.0
**Status**: Ready for Testing
