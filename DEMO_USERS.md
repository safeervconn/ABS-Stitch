# Demo User Credentials

## Important Setup Note
Since this is a development setup, you'll need to create these users manually in your Supabase Auth dashboard or through the signup process. The database is pre-configured to work with these specific user IDs.

## Demo Users for Testing

### 1. Admin User
- **Email**: `admin@absstitch.com`
- **Password**: `admin123!`
- **Role**: Admin
- **Access**: Full system access, user management, system settings
- **Dashboard**: `/admin/dashboard`

### 2. Sales Representative
- **Email**: `sales@absstitch.com`
- **Password**: `sales123!`
- **Role**: Sales Rep
- **Access**: Customer management, order assignment, sales tracking
- **Dashboard**: `/sales/dashboard`

### 3. Designer
- **Email**: `designer@absstitch.com`
- **Password**: `design123!`
- **Role**: Designer
- **Access**: Project management, artwork creation, order completion
- **Dashboard**: `/designer/dashboard`

### 4. Customer
- **Email**: `customer@example.com`
- **Password**: `customer123!`
- **Role**: Customer
- **Access**: Order placement, order tracking, catalog browsing
- **Dashboard**: `/customer/dashboard`

### 5. Additional Customer
- **Email**: `mike@techcompany.com`
- **Password**: `mike123!`
- **Role**: Customer
- **Company**: Tech Company
- **Dashboard**: `/customer/dashboard`

## Quick Setup Instructions

### Option 1: Manual User Creation (Recommended for Development)
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" for each demo user
4. Use the emails and passwords listed above
5. The database will automatically create profiles when users sign up

### Option 2: Through Application Signup
1. Use the `/signup` page in your application
2. Create accounts with the emails above
3. Select the appropriate role during signup
4. The system will automatically create the necessary database records

## Database Features Included

### Sample Data
- **Products**: 6 sample embroidery designs with different categories
- **Orders**: 4 sample orders in various stages (pending, in_progress, completed, review)
- **Comments**: Order communication examples
- **Relationships**: Proper customer-sales rep-designer assignments

### Dashboard Functionality
- **Admin**: View all users, orders, and system metrics
- **Sales Rep**: Manage assigned customers and orders
- **Designer**: View assigned projects and update status
- **Customer**: Track personal orders and place new ones

### Security Features
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Simplified policies for development environment
- Proper data isolation between users

## Testing Scenarios

1. **Customer Flow**: Login as customer → Browse catalog → Place order → Track progress
2. **Sales Flow**: Login as sales rep → View customer orders → Assign to designer
3. **Designer Flow**: Login as designer → View assigned orders → Update status → Add comments
4. **Admin Flow**: Login as admin → View all system activity → Manage users

## Connection Verification

Test your database connection by:
1. Logging in with any demo user
2. Checking that the appropriate dashboard loads
3. Verifying that role-specific data is displayed
4. Testing CRUD operations (create, read, update based on role permissions)