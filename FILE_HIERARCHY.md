# ArtistryDigital - File Hierarchy and Documentation

## Project Structure Overview

This document provides a comprehensive overview of the file structure and the purpose of each file in the ArtistryDigital project.

## Root Directory Files

### Configuration Files
- **package.json** - Project dependencies, scripts, and metadata
- **vite.config.ts** - Vite build tool configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS configuration for CSS processing
- **tsconfig.json** - TypeScript configuration root
- **tsconfig.app.json** - TypeScript configuration for application code
- **tsconfig.node.json** - TypeScript configuration for Node.js code
- **eslint.config.js** - ESLint configuration for code linting

### Environment & Documentation
- **.env.example** - Example environment variables file
- **FILE_HIERARCHY.md** - This documentation file

### HTML Entry Point
- **index.html** - Main HTML template and application entry point

## Source Directory (/src)

### Main Application Files
- **main.tsx** - Application entry point, renders React app
- **App.tsx** - Main application component with routing configuration
- **index.css** - Global styles, Tailwind imports, and custom animations
- **vite-env.d.ts** - TypeScript environment declarations for Vite

### Components Directory (/src/components)
All reusable UI components for the main website:

- **Navbar.tsx** - Navigation bar with responsive menu and cart
- **Hero.tsx** - Homepage hero section with call-to-action
- **CatalogPreview.tsx** - Preview of artwork catalog with sample products
- **Services.tsx** - Services section showcasing business offerings
- **Testimonials.tsx** - Customer testimonials with carousel
- **QuoteForm.tsx** - Contact/quote request form with validation
- **ContactInfo.tsx** - Contact information display card
- **Footer.tsx** - Website footer with links and company info
- **CartDropdown.tsx** - Shopping cart dropdown with item management

### Pages Directory (/src/pages)
Individual page components:

#### Public Pages
- **Catalog.tsx** - Full product catalog with filtering and search
- **About.tsx** - Company information and team details
- **Login.tsx** - User authentication login form
- **Signup.tsx** - User registration form with role selection

#### Dashboard Pages (Role-Based)
- **AdminDashboard.tsx** - Administrator dashboard with system overview
- **SalesRepDashboard.tsx** - Sales representative dashboard for customer management
- **DesignerDashboard.tsx** - Designer dashboard for project management
- **CustomerDashboard.tsx** - Customer dashboard for order tracking

### Contexts Directory (/src/contexts)
React context providers for state management:

- **CartContext.tsx** - Shopping cart state management and operations

### Library Directory (/src/lib)
Utility functions and external service integrations:

- **supabase.ts** - Supabase client configuration and database operations
- **auth.ts** - Temporary authentication system for demo purposes

## Supabase Directory (/supabase)

### Database Migrations
- **migrations/20250912113758_icy_voice.sql** - Complete database schema with user management, orders, and role-based access control

## Purpose of Each Component

### Navigation & Layout
- **Navbar**: Provides site navigation, user authentication links, and shopping cart access
- **Footer**: Contains company information, service links, and contact details

### Homepage Sections
- **Hero**: Captures visitor attention with compelling messaging and clear CTAs
- **CatalogPreview**: Showcases sample artwork to encourage catalog browsing
- **Services**: Explains business offerings and value propositions
- **Testimonials**: Builds trust through customer feedback and reviews
- **QuoteForm**: Enables lead generation through quote requests
- **ContactInfo**: Provides easy access to contact information

### E-commerce Features
- **CartDropdown**: Manages shopping cart functionality with add/remove/update operations
- **CartContext**: Centralizes cart state management across the application

### User Management
- **Login/Signup**: Handles user authentication and registration
- **Role-based Dashboards**: Provides customized interfaces for different user types

### Database Integration
- **Supabase Integration**: Manages user profiles, orders, products, and role-based access
- **Authentication System**: Temporary demo system with predefined user roles

## Key Features Implemented

### 1. Role-Based Access Control
- Admin: System management and oversight
- Sales Rep: Customer relationship management
- Designer: Project and artwork management  
- Customer: Order tracking and account management

### 2. E-commerce Functionality
- Product catalog with filtering and search
- Shopping cart with persistent state
- Order management system

### 3. Responsive Design
- Mobile-first approach with Tailwind CSS
- Consistent design system across all components
- Smooth animations and transitions

### 4. Performance Optimizations
- Lazy loading for images
- Optimized font loading
- Efficient state management
- Smooth animations with CSS transitions

### 5. User Experience
- Intuitive navigation
- Clear visual hierarchy
- Consistent branding and typography
- Accessible design patterns

## Development Notes

### Temporary Features (For Demo)
- **auth.ts**: Contains temporary user authentication system
- Predefined demo users for each role
- Local storage session management

### Production Considerations
- Replace temporary auth with full Supabase authentication
- Implement proper error handling and validation
- Add comprehensive testing suite
- Set up CI/CD pipeline
- Implement proper logging and monitoring

### Design System
- **Font Family**: Nunito (consistent across all components)
- **Color Scheme**: Blue/Indigo primary with semantic colors
- **Spacing**: 8px grid system
- **Animations**: Smooth transitions with optimized performance