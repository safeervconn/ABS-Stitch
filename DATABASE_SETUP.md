# Database Setup Guide

## Complete Database Configuration for Multi-Role Embroidery Application

### 1. Supabase Project Setup

#### Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `abs-stitch-app` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location

#### Get Connection Details
1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Environment Configuration

#### Create .env file
```bash
# Copy the example file
cp .env.example .env
```

#### Update .env with your values
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Database Migration

#### Run the Migration
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/complete_database_setup.sql`
4. Paste and run the SQL script
5. Verify all tables are created successfully

#### Alternative: Use Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset
supabase db push
```

### 4. Authentication Setup

#### Configure Auth Settings
1. Go to Authentication > Settings in Supabase dashboard
2. **Disable email confirmation** for development:
   - Uncheck "Enable email confirmations"
3. **Set Site URL**: `http://localhost:5173` (or your dev server URL)
4. **Add redirect URLs**: `http://localhost:5173/**`

#### Create Demo Users
Use one of these methods:

**Method 1: Through Supabase Dashboard**
1. Go to Authentication > Users
2. Click "Add user"
3. Create each demo user with email/password from DEMO_USERS.md

**Method 2: Through Application**
1. Start your development server: `npm run dev`
2. Go to `/signup`
3. Create accounts for each demo user
4. Select appropriate roles during signup

### 5. Verification Steps

#### Test Database Connection
```javascript
// Test in browser console or create a test file
import { supabase } from './src/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);
  
  console.log('Connection test:', { data, error });
};

testConnection();
```

#### Verify Sample Data
1. Check that products are visible in catalog: `/catalog`
2. Login with different roles and verify dashboards load
3. Test role-based access (customers can't see admin features, etc.)

### 6. Development Features

#### Simplified Security
- RLS policies are permissive for development
- Easy user switching for testing
- No complex authentication flows
- Direct database access for debugging

#### Sample Data Included
- **6 Products**: Various embroidery designs with images
- **5 Users**: One for each role + extra customer
- **4 Orders**: Different statuses for testing workflows
- **Comments**: Order communication examples

#### Role-Based Dashboards
- **Admin**: `/admin/dashboard` - System overview
- **Sales Rep**: `/sales/dashboard` - Customer management
- **Designer**: `/designer/dashboard` - Project management  
- **Customer**: `/customer/dashboard` - Order tracking

### 7. Troubleshooting

#### Common Issues

**Connection Errors**
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
- Check that .env file is in project root
- Restart dev server after changing .env

**Authentication Issues**
- Disable email confirmation in Supabase Auth settings
- Check Site URL and redirect URLs are correct
- Verify user exists in Authentication > Users

**Permission Errors**
- Check RLS policies are created correctly
- Verify user has correct role in user_profiles table
- Test with admin user first (has broadest access)

**Missing Data**
- Re-run the migration script
- Check that sample data was inserted correctly
- Verify foreign key relationships

#### Reset Database
If you need to start over:
```sql
-- Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Then re-run the migration script.

### 8. Production Considerations

When moving to production:
1. **Enable email confirmation**
2. **Strengthen RLS policies**
3. **Add proper error handling**
4. **Implement rate limiting**
5. **Add audit logging**
6. **Use environment-specific configurations**

This setup prioritizes development speed and testing capability over production security.