# Business Setup Guide

This guide explains how to configure this embroidery order management system for a new business. The system is designed to be easily customizable through environment variables without requiring code changes.

## Quick Start

1. **Copy the project to your new server**
2. **Copy `.env.example` to `.env`**
3. **Configure your business settings in `.env`**
4. **Run `npm install` and `npm run build`**
5. **Deploy to your hosting provider**

## Configuration Overview

All business-specific settings are controlled through environment variables in the `.env` file. This allows you to run the same codebase for multiple businesses by simply changing the configuration.

## Required Configuration

### 1. Supabase Database

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Setup Steps:**
1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key from Settings > API
3. Run the migrations in the `supabase/migrations` folder
4. Set up Row Level Security policies as defined in the migrations

### 2. Business Information

```bash
VITE_BUSINESS_NAME=Your Business Name
VITE_BUSINESS_TAGLINE=Your Business Tagline or Description
```

This will replace "ABS STITCH" throughout the application with your business name.

### 3. Contact Information

```bash
VITE_CONTACT_EMAIL=contact@yourbusiness.com
VITE_CONTACT_PHONE=+1 (555) 123-4567
VITE_CONTACT_ADDRESS=123 Business St, City, State 12345
```

These appear in the footer, contact page, and customer communications.

## Optional Configuration

### Theme Customization

Customize the look and feel of your application:

```bash
# Primary brand colors (hex format)
VITE_THEME_PRIMARY=#3b82f6
VITE_THEME_PRIMARY_HOVER=#2563eb
VITE_THEME_SECONDARY=#10b981
VITE_THEME_ACCENT=#f59e0b

# Gradient backgrounds (CSS gradient strings)
VITE_THEME_GRADIENT_PRIMARY=linear-gradient(135deg, #667eea 0%, #764ba2 100%)
VITE_THEME_GRADIENT_HERO=linear-gradient(135deg, #667eea 0%, #764ba2 100%)
VITE_THEME_GRADIENT_CARD=linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**Tips:**
- Use a color picker to get hex values for your brand colors
- Test gradients at https://cssgradient.io/
- Keep sufficient contrast between text and background colors

### Branding Assets

```bash
VITE_LOGO_URL=/logo.svg
VITE_FAVICON_URL=/favicon.ico
```

Place your logo file in the `public` folder and reference it here.

### Social Media Links

```bash
VITE_SOCIAL_FACEBOOK=https://facebook.com/yourbusiness
VITE_SOCIAL_INSTAGRAM=https://instagram.com/yourbusiness
VITE_SOCIAL_TWITTER=https://twitter.com/yourbusiness
VITE_SOCIAL_LINKEDIN=https://linkedin.com/company/yourbusiness
```

Leave empty to hide social media links in the footer.

### Feature Flags

Enable or disable features based on your business needs:

```bash
VITE_FEATURE_STOCK_DESIGNS=true          # Show stock designs catalog
VITE_FEATURE_CUSTOM_ORDERS=true          # Allow custom order requests
VITE_FEATURE_QUOTE_REQUESTS=true         # Show quote request form
VITE_FEATURE_MULTIPLE_PAYMENT_GATEWAYS=false  # Enable multiple payment options
```

### Pricing Settings

```bash
VITE_CURRENCY=USD        # Currency code (USD, EUR, GBP, etc.)
VITE_TAX_RATE=0          # Tax rate as decimal (0.08 for 8%)
```

### Order Workflow

```bash
VITE_DEFAULT_ORDER_STATUS=pending
```

Default status for new orders. Options: `pending`, `in_progress`, `completed`, `cancelled`, `on_hold`

## Payment Gateway Configuration

### 2Checkout (Default)

```bash
VITE_DEFAULT_PAYMENT_GATEWAY=twoCheckout
VITE_2CO_ENABLED=true
VITE_2CO_MERCHANT_CODE=your_merchant_code
VITE_2CO_SECRET_KEY=your_secret_key
VITE_2CO_API_URL=https://api.2checkout.com
```

**Setup Steps:**
1. Create a 2Checkout account at https://www.2checkout.com
2. Get your Merchant Code from Account Settings
3. Generate a Secret Key from Integrations > Webhooks & API
4. Set up the webhook URL in 2Checkout dashboard to point to your deployed function

### Additional Payment Gateways (Future)

```bash
VITE_STRIPE_ENABLED=false
VITE_PAYPAL_ENABLED=false
```

Currently only 2Checkout is supported. Leave these as `false`.

## Deployment Checklist

Before deploying your configured application:

- [ ] All required environment variables are set in `.env`
- [ ] Supabase database is created and migrations are applied
- [ ] Logo and favicon files are placed in the `public` folder
- [ ] Theme colors are tested for readability and contrast
- [ ] Payment gateway credentials are correctly configured
- [ ] Test user accounts are created for each role (admin, designer, sales_rep, customer)
- [ ] Row Level Security policies are enabled in Supabase
- [ ] Edge functions are deployed to Supabase (see SUPABASE_SECRETS_SETUP.md)
- [ ] `npm run build` completes successfully without errors

## Testing Your Configuration

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run preview
   ```

3. **Verify:**
   - Business name appears correctly throughout the site
   - Contact information is displayed correctly
   - Theme colors are applied as expected
   - All enabled features are accessible
   - Disabled features are hidden
   - Payment processing works end-to-end

## Multi-Business Deployment Strategy

To run this application for multiple businesses:

1. **Create separate Supabase projects** for each business
2. **Create separate deployment environments** (different servers or subdomains)
3. **Configure each `.env` file** with business-specific settings
4. **Use separate domains/subdomains** for each business
5. **Keep the codebase identical** across all deployments

Example structure:
```
business-a.yourdomain.com  →  Uses .env with Business A config
business-b.yourdomain.com  →  Uses .env with Business B config
business-c.yourdomain.com  →  Uses .env with Business C config
```

## Configuration Files Reference

### Primary Configuration Files

- `/src/config/business.config.ts` - Business information settings
- `/src/config/theme.config.ts` - Theme and styling configuration
- `/src/config/payment.config.ts` - Payment gateway configuration
- `/src/shared/utils/featureFlags.ts` - Feature flag utilities

### Environment Files

- `.env` - Your actual configuration (not committed to git)
- `.env.example` - Template with all available options

## Troubleshooting

### Business Name Not Updating

Make sure you've:
1. Set `VITE_BUSINESS_NAME` in your `.env` file
2. Restarted the dev server (environment changes require restart)
3. Cleared browser cache

### Theme Colors Not Applying

1. Check that color values are valid hex codes (e.g., `#3b82f6`)
2. Ensure the `applyTheme()` function is called in `main.tsx`
3. Clear browser cache and hard refresh

### Features Not Showing/Hiding

1. Feature flags must be `true` or `false` (lowercase)
2. Restart dev server after changing feature flags
3. Check browser console for any errors

### Payment Gateway Issues

1. Verify your merchant credentials are correct
2. Check that webhook URL is configured in payment gateway dashboard
3. Ensure Supabase edge functions are deployed
4. Review edge function logs in Supabase dashboard

## Support

For technical issues:
1. Check browser console for errors
2. Review Supabase logs for database errors
3. Check edge function logs for payment processing issues
4. Verify all environment variables are set correctly

## Security Best Practices

1. **Never commit `.env` file to version control**
2. **Use strong passwords for admin accounts**
3. **Keep Supabase keys secure**
4. **Regularly update dependencies**
5. **Enable Row Level Security on all Supabase tables**
6. **Use HTTPS in production**
7. **Rotate payment gateway keys periodically**

## Backup and Maintenance

1. **Regular Supabase backups** - Enable automatic backups in Supabase dashboard
2. **Monitor error logs** - Check Supabase logs regularly
3. **Keep configuration documented** - Maintain a record of your settings
4. **Test after updates** - Verify functionality after any code updates

## Next Steps

After setup:
1. Create admin user account
2. Configure email templates (if using email notifications)
3. Add your stock designs
4. Set up pricing tiers
5. Train staff on using the system
6. Monitor initial orders closely

## Additional Resources

- Supabase Documentation: https://supabase.com/docs
- 2Checkout Documentation: https://www.2checkout.com/documentation
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
