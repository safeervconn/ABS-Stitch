# 2Checkout Integration - Complete Guide

## Overview

This application integrates with 2Checkout (Verifone) to process payments for stock designs and custom orders. The integration includes:

1. **Invoice Generation** - Admins can select orders and generate payment invoices
2. **Hosted Checkout** - Customers pay via 2Checkout's secure hosted checkout page
3. **Webhook Processing** - Automatic order fulfillment when payment is received
4. **File Delivery** - Stock design files are automatically copied to customer's order when paid

## Architecture

```
Admin Dashboard
    ↓
Generate Invoice (Edge Function)
    ↓
Create Invoice + Payment Link
    ↓
Customer Pays via 2Checkout
    ↓
2Checkout IPN Webhook
    ↓
Update Invoice & Orders (Edge Function)
    ↓
Copy Stock Design Files
    ↓
Customer Access Granted
```

## Setup Instructions

### Step 1: Configure Supabase Secrets

All 2Checkout credentials must be stored as **Supabase Secrets** (not in `.env` files).

#### Required Secrets:

1. **TCO_INS_SECRET_WORD** (Required for webhooks)
   - Where to find: 2Checkout Dashboard → Integrations → Webhooks & API → INS Settings
   - Used for: Verifying webhook signatures

2. **TCO_MERCHANT_CODE** (Required for payment links)
   - Where to find: 2Checkout Dashboard → Account Settings
   - Used for: Generating payment links

3. **TCO_BUY_LINK_SECRET** (Required for payment links)
   - Where to find: 2Checkout Dashboard → Integrations → Webhooks & API → Buy Link Secret
   - Used for: Signing payment link URLs

4. **TCO_SECRET_KEY** (Optional)
   - Where to find: 2Checkout Dashboard → Integrations → Webhooks & API
   - Used for: API authentication (if needed for future features)

#### Set Secrets via CLI:

```bash
# Run the setup script
chmod +x setup-2checkout-secrets.sh
./setup-2checkout-secrets.sh
```

Or manually:

```bash
supabase secrets set TCO_INS_SECRET_WORD="your_ins_secret_word"
supabase secrets set TCO_MERCHANT_CODE="your_merchant_code"
supabase secrets set TCO_BUY_LINK_SECRET="your_buy_link_secret"
```

#### Set Secrets via Dashboard:

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add each secret with its name and value

### Step 2: Configure 2Checkout Webhook

1. Login to 2Checkout Dashboard
2. Go to **Integrations** → **Webhooks & API** → **INS Settings**
3. Set the webhook URL to:
   ```
   https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook
   ```
4. Enable the webhook
5. Select events to send (at minimum: ORDER_CREATED, FRAUD_STATUS_CHANGED, REFUND_ISSUED)
6. Click **Test** to verify the endpoint responds correctly
7. Save settings

### Step 3: Test the Integration

#### Test 1: Webhook Endpoint Health Check

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

#### Test 2: Generate Test Invoice

Use the admin dashboard to:
1. Select one or more orders for a customer
2. Click "Generate Invoice"
3. Verify invoice is created with payment link
4. Click the payment link to test checkout flow

#### Test 3: Test Payment Flow

1. Use 2Checkout test card numbers:
   - **Success**: 4111111111111111
   - **Failure**: 4000000000000002
2. Complete test payment
3. Verify webhook is called (check Supabase logs)
4. Verify invoice status changes to "paid"
5. Verify orders status changes to "paid"
6. Verify stock design files are copied (if applicable)

## Edge Functions

### 1. generate-invoice

**Purpose**: Creates invoice and generates 2Checkout payment link

**Endpoint**: `https://iutxllhudjckcaiwabud.supabase.co/functions/v1/generate-invoice`

**Authentication**: Required (Admin only)

**Request**:
```json
{
  "orderIds": ["uuid1", "uuid2"],
  "customerId": "customer-uuid",
  "returnUrl": "https://yourapp.com/payment/success",
  "cancelUrl": "https://yourapp.com/payment/cancelled"
}
```

**Response**:
```json
{
  "success": true,
  "invoice": {
    "id": "invoice-uuid",
    "total_amount": 150.00,
    "payment_link": "https://secure.2checkout.com/order/checkout.php?...",
    "order_count": 2
  }
}
```

**Usage in React**:
```typescript
const generateInvoice = async (orderIds: string[], customerId: string) => {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderIds,
        customerId,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancelled`,
      }),
    }
  );

  return await response.json();
};
```

### 2. handle-2co-webhook

**Purpose**: Processes IPN notifications from 2Checkout

**Endpoint**: `https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook`

**Authentication**: None (public webhook, secured by signature verification)

**Handles**:
- Payment verification
- Invoice status updates
- Order status updates
- Stock design file copying
- Customer notifications

**Payment Statuses**:
- `COMPLETE` - Payment successful
- `AUTHRECEIVED` - Payment authorized
- `PAYMENT_AUTHORIZED` - Payment authorized
- `PENDING` - Payment pending
- `CANCELED` - Payment cancelled
- `REFUND` - Payment refunded

## Database Schema

### invoices Table

```sql
id                    uuid PRIMARY KEY
customer_id           uuid REFERENCES users(id)
order_ids             uuid[] (array of order IDs)
total_amount          decimal
status                text (pending, paid, cancelled)
payment_link          text (2Checkout checkout URL)
tco_reference_number  text (2Checkout REFNO)
tco_order_id          text (2Checkout ORDERNO)
tco_payment_method    text (payment method used)
created_by            uuid REFERENCES users(id)
created_at            timestamptz
updated_at            timestamptz
```

### orders Table (Updated)

```sql
invoice_id       uuid REFERENCES invoices(id)
payment_status   text (paid, unpaid, cancelled, pending_payment)
```

### Triggers

1. **sync_order_payment_status** - Updates order payment status when invoice status changes
2. **update_order_invoice_link** - Updates order payment status when linked to invoice

## Payment Flow

### 1. Invoice Generation (Admin)

```
Admin selects orders
    ↓
Calls generate-invoice Edge Function
    ↓
Creates invoice record in database
    ↓
Generates signed 2Checkout payment link
    ↓
Updates invoice with payment_link
    ↓
Links orders to invoice (invoice_id)
    ↓
Sets order payment_status to 'pending_payment'
    ↓
Sends notification to customer
```

### 2. Customer Payment

```
Customer clicks payment link
    ↓
Redirects to 2Checkout hosted checkout
    ↓
Customer enters payment details
    ↓
2Checkout processes payment
    ↓
Customer redirected to returnUrl (success) or cancelUrl (cancelled)
```

### 3. Webhook Processing (Automatic)

```
2Checkout sends IPN notification
    ↓
handle-2co-webhook receives POST request
    ↓
Verifies signature using INS_SECRET_WORD
    ↓
Validates payment amount matches invoice
    ↓
Updates invoice status to 'paid'
    ↓
Updates invoice with 2CO transaction details
    ↓
Trigger updates order payment_status to 'paid'
    ↓
For stock design orders: Copy files to order-attachments
    ↓
Customer can now access purchased files
```

## Security

### Secrets Management

- **Never** commit secrets to Git
- **Never** expose secrets in frontend code
- **Always** use Supabase Secrets for sensitive data
- Secrets are only accessible by Edge Functions
- Frontend uses VITE_ prefixed env vars for public data only

### Webhook Security

- All webhooks verify signature using INS Secret Word
- MD5 hash validation following 2Checkout specification
- Invalid signatures are rejected (but return 200 OK per 2CO requirements)
- Amount validation ensures payment matches invoice

### Payment Link Security

- Links are signed with HMAC-SHA256
- Signature includes all payment parameters
- merchant-order-id links payment to specific invoice
- 2Checkout validates signature before accepting payment

## Monitoring & Debugging

### View Edge Function Logs

```bash
# View real-time logs
supabase functions logs handle-2co-webhook --follow

# View recent logs
supabase functions logs handle-2co-webhook --limit 100
```

### Check Webhook Calls

Logs include:
- Full webhook payload
- Signature verification status
- Invoice lookup results
- Payment processing status
- File copy operations

### Common Issues

**Issue**: Webhook returns 500 error
**Solution**: Check if TCO_INS_SECRET_WORD is set in Supabase Secrets

**Issue**: Signature verification fails
**Solution**: Verify INS Secret Word matches exactly in both systems

**Issue**: Invoice not found
**Solution**: Ensure merchant-order-id in payment matches invoice.id

**Issue**: Amount mismatch
**Solution**: Verify payment amount equals invoice total_amount

**Issue**: Files not copied
**Solution**: Check stock_designs table has attachment_url and attachment_filename

## Testing with 2Checkout Sandbox

1. Create 2Checkout sandbox account
2. Use sandbox credentials in Supabase Secrets
3. Use test card numbers for payments
4. Monitor webhook calls in Supabase logs
5. Verify end-to-end flow

### Test Card Numbers

- **Visa**: 4111111111111111
- **Mastercard**: 5431111111111111
- **Discover**: 6011601160116611
- **Amex**: 370000000000002

Use any future expiry date and any CVV.

## Production Checklist

- [ ] All Supabase Secrets configured with production credentials
- [ ] Webhook URL configured in production 2Checkout account
- [ ] Webhook URL tested and verified
- [ ] Test payment completed successfully
- [ ] Invoice generation tested
- [ ] Order status updates verified
- [ ] File delivery tested (for stock designs)
- [ ] Customer notifications working
- [ ] Error logging reviewed
- [ ] Return URLs point to production domain
- [ ] SSL/HTTPS enabled on all endpoints

## Support Resources

- **2Checkout API Docs**: https://verifone.cloud/docs/2checkout/API-Integration
- **Hosted Checkout**: https://verifone.cloud/docs/2checkout/API-Integration/Payment-API/Hosted
- **IPN Setup**: https://verifone.cloud/docs/2checkout/API-Integration/Webhooks/INS-Setup
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Supabase Secrets**: https://supabase.com/docs/guides/functions/secrets

## Quick Reference

### Environment Variables (.env) - Public Only
```bash
VITE_SUPABASE_URL=https://iutxllhudjckcaiwabud.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Secrets - Private Credentials
```bash
TCO_INS_SECRET_WORD=your_ins_secret
TCO_MERCHANT_CODE=your_merchant_code
TCO_BUY_LINK_SECRET=your_buy_link_secret
TCO_SECRET_KEY=your_secret_key
```

### Key URLs
- **Webhook**: `https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook`
- **Generate Invoice**: `https://iutxllhudjckcaiwabud.supabase.co/functions/v1/generate-invoice`
- **2Checkout Checkout**: `https://secure.2checkout.com/order/checkout.php`

---

**Last Updated**: 2025-10-27
**Version**: 1.0
