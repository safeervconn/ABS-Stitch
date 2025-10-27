# 2Checkout Payment Integration Guide

## Overview

This document describes how the 2Checkout payment integration works in the application, including the invoice generation workflow and the technical implementation details.

---

## Admin Workflow: Generating Invoice with Payment Link

### Step 1: Select Orders
1. Navigate to the **Admin Dashboard**
2. Go to the **Invoice Management** tab
3. Click the **Generate Invoice** button
4. Select the customer and the orders you want to include in the invoice

### Step 2: Generate Invoice
1. Review the selected orders and total amount
2. Click **Generate Invoice**
3. The system will automatically:
   - Create the invoice in the database
   - Generate a secure 2Checkout payment URL
   - Link the payment URL to the invoice
   - Notify the customer about the new invoice

### Step 3: Share Payment Link
1. The payment link is automatically stored with the invoice
2. You can view it in the invoice details
3. You can copy the link and share it with the customer via email or other channels
4. The customer can use this link to pay for their orders

### Step 4: Regenerate Payment Link (if needed)
1. If a payment link expires or needs to be regenerated:
2. Find the invoice in the Invoice Management tab
3. Click the **Regenerate Payment Link** button (refresh icon)
4. A new secure payment link will be generated

---

## Technical Implementation

### Architecture

The payment integration uses **Supabase Edge Functions** to securely handle 2Checkout payment URL generation and webhook processing.

#### Edge Functions

1. **`generate-2co-payment-url`**
   - Generates secure payment checkout URLs
   - Uses HMAC-SHA256 signature with length-prefixed values (per Verifone/2Checkout requirements)
   - Includes comprehensive debug logging for troubleshooting

2. **`handle-2co-webhook`**
   - Processes Instant Payment Notifications (IPN) from 2Checkout
   - Verifies webhook signatures using MD5 hash
   - Updates invoice status when payment is successful
   - Copies stock design files to order attachments when applicable

### Security

All sensitive credentials are stored as **Supabase Secrets** and are **never exposed to the frontend**:

- `TCO_SELLER_ID` - Your 2Checkout seller ID (also called merchant code)
- `TCO_SECRET_WORD` - Used for signing dynamic product payment URLs (SHA256)
- `TCO_INS_SECRET_WORD` - Used for verifying webhook signatures (MD5)

The frontend code only calls the Edge Function endpoints and never handles credentials directly.

### Signature Generation Algorithm

The payment URL signature follows Verifone's specification for dynamic product checkout:

**Formula**: `SHA256(secretWord + sellerId + currency + total)`

Where:
- `secretWord` = Your 2Checkout Secret Word (`TCO_SECRET_WORD`)
- `sellerId` = Your 2Checkout Seller ID (`TCO_SELLER_ID`)
- `currency` = Payment currency (e.g., "USD")
- `total` = Sum of (price × quantity) for all products, formatted to 2 decimals

Example:
```
secretWord: "mySecret123"
sellerId: "254923900946"
currency: "USD"
total: "20.00" (calculated from products)

toSign: "mySecret123254923900946USD20.00"
signature: SHA256(toSign) = "a1b2c3d4..."
```

**Important**: This is different from the Buy Link signature method. Dynamic products use a simpler SHA256 hash without parameter sorting or length-prefixing.

### Debug Logging

When generating payment URLs, the Edge Function logs:
- Invoice ID and products
- Currency and calculated total
- Seller ID
- String to sign (concatenated: secretWord + sellerId + currency + total)
- Generated signature (SHA256 hash)
- Final checkout URL

These logs can be viewed in the Supabase Dashboard under **Edge Functions → Logs**.

---

## Webhook Configuration

### 2Checkout Dashboard Setup

1. Log in to your [2Checkout/Verifone Dashboard](https://secure.2checkout.com/)
2. Navigate to **Integrations → Webhooks & API**
3. Set the IPN URL to:
   ```
   https://[YOUR-SUPABASE-PROJECT].supabase.co/functions/v1/handle-2co-webhook
   ```
4. Ensure the **INS Secret Word** matches the `TCO_INS_SECRET_WORD` in Supabase Secrets

### Webhook Processing Flow

1. Customer completes payment on 2Checkout
2. 2Checkout sends IPN to your webhook URL
3. Edge Function verifies the signature
4. If payment is successful:
   - Invoice status is updated to `paid`
   - Associated orders are updated with payment details
   - Stock design files are copied to order attachments (if applicable)

---

## Troubleshooting

### "Empty Cart" Error on 2Checkout

This was caused by using the wrong signature algorithm. The issue has been fixed by:
- Using the correct dynamic product signature formula: `SHA256(secretWord + sellerId + currency + total)`
- Calculating the total as sum of (price × quantity) for all products
- Using plain SHA256 hash (not HMAC) as per Verifone's dynamic product specification
- No parameter sorting or length-prefixing required for dynamic products

### Testing Payment Links

1. Generate an invoice through the admin dashboard
2. Copy the payment link from the invoice details
3. Open the link in a browser
4. Verify that the checkout page shows:
   - Correct merchant name
   - Product details
   - Total amount
   - Currency (USD)

### Viewing Logs

To debug issues:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions**
4. Select `generate-2co-payment-url` or `handle-2co-webhook`
5. View the **Logs** tab for detailed debug information

---

## Code Structure

```
supabase/functions/
├── _shared/
│   ├── corsHeaders.ts              # CORS configuration
│   └── twoCheckoutHelpers.ts       # Shared payment logic
├── generate-2co-payment-url/
│   └── index.ts                    # Payment URL generation
└── handle-2co-webhook/
    └── index.ts                    # Webhook handler

src/
├── services/
│   └── invoiceService.ts           # Frontend invoice creation
└── admin/
    └── tabs/
        └── InvoiceManagementTab.tsx  # Admin UI for invoices
```

---

## Important Notes

1. **Always use the Edge Function** to generate payment links - never generate them in frontend code
2. **Secrets are configured in Supabase** - they are automatically available to Edge Functions
3. **Payment links are single-use** - regenerate if a customer needs a new link
4. **Webhook signature verification** is critical - always verify before processing payments
5. **Test in sandbox first** - use 2Checkout's test mode before going live

---

## Support

For technical issues:
1. Check the Edge Function logs in Supabase Dashboard
2. Verify that all Supabase Secrets are correctly configured
3. Ensure webhook URL is correctly set in 2Checkout dashboard
4. Review the debug logs for signature generation details

For 2Checkout/Verifone specific questions:
- Documentation: https://verifone.cloud/docs/2checkout/
- Support: https://www.2checkout.com/support/
