# ABS STITCH - Professional Custom Embroidery Services

**Where We Stitch Perfection!**

A modern, full-stack web application for custom embroidery and stitching services built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Customer Features
- **Custom Order Placement**: Submit design requirements with file uploads
- **Catalog Browsing**: Browse ready-made embroidery designs
- **Order Tracking**: Real-time order status updates
- **Invoice Management**: View and pay invoices
- **Shopping Cart**: Add catalog items to cart for batch ordering

### Staff Features
- **Sales Representative Dashboard**: Manage customer relationships and orders
- **Designer Dashboard**: Handle assigned design projects
- **Admin Panel**: Complete system management and oversight

### Technical Features
- **Performance Optimized**: Lazy loading, caching, and optimized animations
- **SEO Optimized**: Complete meta tags, structured data, and social sharing
- **Responsive Design**: Mobile-first approach with smooth animations
- **Real-time Notifications**: Live updates for order status changes
- **Role-based Access Control**: Secure authentication and authorization

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── layout/          # Layout components
│   └── optimized/       # Performance-optimized components
├── pages/               # Page components
├── admin/               # Admin module
├── customer/            # Customer module
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── lib/                 # External library configurations
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abs-stitch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Create an admin user**
   ```bash
   npm run create-admin
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Core Tables
- **customers**: Customer profiles and information
- **employees**: Staff members (admin, sales_rep, designer)
- **products**: Catalog items and designs
- **orders**: Customer orders and project tracking
- **invoices**: Billing and payment management
- **notifications**: Real-time user notifications
- **apparel_types**: Product categorization

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure file storage with Supabase Storage

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) to Indigo (#6366f1)
- **Success**: Green (#10b981) to Emerald (#059669)
- **Warning**: Purple (#8b5cf6) to Pink (#ec4899)
- **Danger**: Red (#ef4444) to Red (#dc2626)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800
- **Line Heights**: 150% for body, 120% for headings

### Animations
- **Duration**: 150ms (fast), 300ms (normal), 500ms (slow)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Effects**: Fade, slide, scale, lift, glow

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript checks
- `npm run optimize` - Run full optimization pipeline

### Code Organization
- **Components**: Modular, reusable components with single responsibility
- **Hooks**: Custom hooks for data fetching and state management
- **Utils**: Pure utility functions for common operations
- **Types**: TypeScript interfaces and type definitions

### Performance Optimizations
- **Lazy Loading**: Images and components load on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Debouncing**: Search and filter operations
- **Caching**: Data caching with configurable TTL
- **Bundle Splitting**: Optimized chunk splitting for faster loads

## 🔐 Authentication & Authorization

### User Roles
1. **Customer**: Place orders, track progress, manage invoices
2. **Sales Representative**: Manage customer relationships and orders
3. **Designer**: Handle design projects and order fulfillment
4. **Administrator**: Full system access and management

### Security Features
- Email/password authentication via Supabase Auth
- Row-level security policies
- Role-based route protection
- Secure file upload and storage

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Touch-optimized interactions
- Collapsible navigation
- Optimized form layouts
- Swipe gestures support

## 🔍 SEO Optimization

### Technical SEO
- Semantic HTML structure
- Meta tags and Open Graph
- Structured data (JSON-LD)
- Sitemap generation
- Performance optimization

### Content SEO
- Descriptive page titles
- Meta descriptions
- Alt text for images
- Heading hierarchy
- Internal linking

## 🚀 Deployment

### Build Process
```bash
npm run optimize  # Run full optimization
npm run build     # Create production build
npm run preview   # Test production build locally
```

### Environment Setup
- Configure environment variables
- Set up Supabase project
- Configure domain and SSL
- Set up monitoring and analytics

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run optimization pipeline
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Consistent formatting
- Component documentation
- Performance considerations

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: hello@absstitch.com
- Phone: (123) 456-7890
- Documentation: [Internal Wiki]

---

**Built with ❤️ by the ABS STITCH development team**