# ABS STITCH - Embroidery Management System

A comprehensive embroidery business management system built with React, TypeScript, and Supabase.

## Features

- **Multi-Role Dashboard System**
  - Admin: System management and oversight
  - Sales Rep: Customer relationship management
  - Designer: Project and artwork management
  - Customer: Order tracking and placement

- **Product Catalog**
  - Browse embroidery designs
  - Filter and search functionality
  - Shopping cart integration

- **Order Management**
  - Custom order placement
  - Status tracking
  - Communication system
  - File attachments

- **Authentication & Security**
  - Role-based access control
  - Secure user authentication
  - Row-level security policies

## Quick Start

### 1. Environment Setup

Copy the environment file and add your Supabase credentials:

```bash
cp .env.example .env
```

Update `.env` with your Supabase project details:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the migration script in your Supabase SQL Editor:
   - Copy contents of `supabase/migrations/complete_database_reset.sql`
   - Paste and execute in Supabase SQL Editor

### 3. Create Demo Users

Create these test users in your Supabase Auth dashboard:

- **Admin**: admin@absstitch.com / admin123!
- **Sales Rep**: sales@absstitch.com / sales123!
- **Designer**: designer@absstitch.com / design123!
- **Customer**: customer@example.com / customer123!

### 4. Install and Run

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── lib/               # Utilities and API clients
├── pages/             # Page components
└── index.css          # Global styles
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

The system uses a comprehensive database schema with:
- User profiles with role-based access
- Product catalog management
- Order and order item tracking
- Communication system with comments
- Proper relationships and constraints

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure authentication with Supabase Auth
- Input validation and sanitization

## License

Private project - All rights reserved