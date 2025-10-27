#!/bin/bash

# 2Checkout Secrets Setup Script
# This script helps you set up the required Supabase secrets for 2Checkout integration

echo "========================================="
echo "2Checkout Supabase Secrets Setup"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "This script will help you set up the required Supabase secrets"
echo "for 2Checkout payment integration."
echo ""
echo "You'll need the following from your 2Checkout account:"
echo "  1. INS Secret Word (required for webhooks)"
echo "  2. Merchant Code (required for payment links)"
echo "  3. Secret Key (for API authentication)"
echo "  4. Buy Link Secret (for hosted checkout)"
echo ""

# Make sure we're linked to the correct project
echo "Checking Supabase project connection..."
supabase projects list

echo ""
read -p "Are you linked to project 'iutxllhudjckcaiwabud'? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Linking to project..."
    supabase link --project-ref iutxllhudjckcaiwabud
fi

echo ""
echo "========================================="
echo "Setting Secrets"
echo "========================================="
echo ""

# INS Secret Word (Required)
echo "1. INS Secret Word (REQUIRED for webhooks)"
echo "   Find this in: 2Checkout Dashboard > Integrations > Webhooks & API > INS Settings"
read -p "   Enter your INS Secret Word: " ins_secret
if [ ! -z "$ins_secret" ]; then
    supabase secrets set TCO_INS_SECRET_WORD="$ins_secret"
    echo "   ✓ TCO_INS_SECRET_WORD set"
else
    echo "   ⚠ Skipped (REQUIRED for webhooks to work!)"
fi
echo ""

# Merchant Code (Required)
echo "2. Merchant Code (REQUIRED for payment links)"
echo "   Find this in: 2Checkout Dashboard > Account Settings"
read -p "   Enter your Merchant Code: " merchant_code
if [ ! -z "$merchant_code" ]; then
    supabase secrets set TCO_MERCHANT_CODE="$merchant_code"
    echo "   ✓ TCO_MERCHANT_CODE set"
else
    echo "   ⚠ Skipped"
fi
echo ""

# Secret Key (Optional)
echo "3. Secret Key (for API authentication)"
echo "   Find this in: 2Checkout Dashboard > Integrations > Webhooks & API"
read -p "   Enter your Secret Key: " secret_key
if [ ! -z "$secret_key" ]; then
    supabase secrets set TCO_SECRET_KEY="$secret_key"
    echo "   ✓ TCO_SECRET_KEY set"
else
    echo "   ⚠ Skipped"
fi
echo ""

# Buy Link Secret (Required)
echo "4. Buy Link Secret (REQUIRED for hosted checkout)"
echo "   Find this in: 2Checkout Dashboard > Integrations > Webhooks & API > Buy Link Secret"
read -p "   Enter your Buy Link Secret: " buy_link_secret
if [ ! -z "$buy_link_secret" ]; then
    supabase secrets set TCO_BUY_LINK_SECRET="$buy_link_secret"
    echo "   ✓ TCO_BUY_LINK_SECRET set"
else
    echo "   ⚠ Skipped"
fi
echo ""

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Secrets have been stored securely in Supabase."
echo ""
echo "Next steps:"
echo "  1. Configure webhook URL in 2Checkout:"
echo "     https://iutxllhudjckcaiwabud.supabase.co/functions/v1/handle-2co-webhook"
echo ""
echo "  2. Test the webhook in 2Checkout dashboard"
echo ""
echo "  3. View logs: supabase functions logs handle-2co-webhook"
echo ""
echo "For detailed instructions, see: 2CO_WEBHOOK_FIX.md"
echo ""
