# 🏖️ San Pedro Beach Resort - Booking & Inventory Management System

A comprehensive web-based booking and inventory management system for San Pedro Beach Resort, built with Next.js, Supabase, and TypeScript.

## 🎯 **Project Overview**

This system transforms manual resort operations into a modern, automated management platform with:
- **Customer-facing store** for online shopping and booking
- **Admin dashboard** for staff management
- **POS system** for in-store transactions
- **Inventory management** with barcode scanning
- **Booking system** for accommodations
- **Payment processing** (Cash & GCash)

## 🏗️ **Technology Stack**

- **Frontend**: Next.js 15.4.6 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons & Lucide React

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20+
- Supabase account
- Vercel account

### **Development Setup**
```bash
# Clone repository
git clone <repository-url>
cd proj-spbr-booking

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=your_app_url
```

## ✅ **Completed Features**

### **🔐 Authentication & User Management**
- ✅ User authentication with Supabase Auth
- ✅ Role-based access control (admin, manager, employee, guest)
- ✅ User profiles system with proper separation from employee data
- ✅ Protected routes and middleware
- ✅ Login/logout functionality

### **🏪 Store System (Customer-Facing)**
- ✅ **Complete store frontend** with product catalog
- ✅ **Category filtering system** with visual cards and emoji icons
- ✅ **Infinite scroll** for efficient product loading
- ✅ **Shopping cart functionality** with real-time updates
- ✅ **Checkout process** for both cash and GCash payments
- ✅ **Order management** with pickup instructions
- ✅ **Responsive design** for mobile and desktop

### **🛒 POS System (Staff-Facing)**
- ✅ **Point of Sale interface** for clerks
- ✅ **Barcode scanning support** (ready for hardware integration)
- ✅ **Real-time inventory updates** during sales
- ✅ **Payment processing** with change calculation
- ✅ **Receipt generation** (ready for thermal printer integration)

### **📦 Inventory Management**
- ✅ **Complete inventory system** with 244+ products
- ✅ **Product categories** with organized structure
- ✅ **Stock tracking** with automatic value calculations
- ✅ **Supplier management** system
- ✅ **Inventory transactions** audit trail
- ✅ **Monthly inventory counting** system
- ✅ **Low stock alerts** and monitoring
- ✅ **Product photos** (3 photo fields per product) ✅ **COMPLETED & VERIFIED**
- ✅ **Barcode/QR code support** with type tracking
- ✅ **Product reviews** and ratings system

### **🏨 Booking System**
- ✅ **Guest management** with comprehensive profiles
- ✅ **Unit/room management** with pricing
- ✅ **Booking creation** and management
- ✅ **Payment tracking** for accommodations
- ✅ **Check-in/check-out** functionality

### **💰 Financial Management**
- ✅ **Expense tracking** for 2025
- ✅ **Employee salary management**
- ✅ **Stakeholder withdrawals** tracking
- ✅ **Employee advances** system
- ✅ **Money denominations** management
- ✅ **Financial reporting** capabilities

### **🗄️ Database & Infrastructure**
- ✅ **Complete database migration** to production-ready schema
- ✅ **UUID standardization** across all tables
- ✅ **Proper data types** (DATE, NUMERIC, INTEGER)
- ✅ **Foreign key relationships** for data integrity
- ✅ **Row Level Security (RLS)** policies
- ✅ **Comprehensive indexes** for performance
- ✅ **Audit trails** for all critical operations
- ✅ **Data validation constraints**

### **📊 Data Import/Export**
- ✅ **CSV import system** for inventory data
- ✅ **CSV export functionality** for reporting
- ✅ **Data validation** and cleaning scripts
- ✅ **Category-based exports**

### **🎨 UI/UX Features**
- ✅ **Green and yellow theme** with dark mode support
- ✅ **Responsive navigation** (desktop and mobile)
- ✅ **Loading states** and error handling
- ✅ **User-friendly interfaces** for all user types
- ✅ **Accessibility features** and semantic HTML

## 🔄 **In Progress**

### **📈 Advanced Features**
- 🔄 **Advanced reporting dashboard**
- 🔄 **Performance optimization**
- 🔄 **Mobile app development** (PWA)

## 📅 **Planned Features**

### **🚀 Future Enhancements**
- 📅 **Customer loyalty program**
- 📅 **Advanced analytics** with charts and graphs
- 📅 **Multi-location support**
- 📅 **Email notifications**
- 📅 **SMS integration**
- 📅 **Advanced search** and filtering

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/     # Main admin dashboard
│   │   ├── pos/          # Point of Sale system
│   │   ├── inventory-count/ # Monthly inventory counting
│   │   ├── data-manager/ # Data management interface
│   │   └── data-import/  # CSV import functionality
│   ├── store/            # Customer-facing store
│   │   └── gcash-payment/ # GCash payment processing
│   ├── auth/             # Authentication pages
│   └── login/            # Login page
├── components/           # Reusable React components
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts      # Supabase client configuration
│   ├── auth.ts          # Authentication utilities
│   └── data-import.ts   # Data import utilities
└── types/               # TypeScript type definitions

docs/                    # Documentation
├── guides/             # User and developer guides
├── reports/            # Development progress reports
├── deployment/         # Deployment documentation
└── migration-plan.md   # Database migration strategy

scripts/                # Utility scripts
├── csv-validator.js    # CSV validation
├── inventory-import.js # Inventory import
└── export-inventory-to-csv.js # Data export

public/
├── csv-imports/        # CSV files for import
└── csv-exports/        # Exported CSV files
```

## 🗄️ **Database Schema**

### **Core Tables**
- `user_profiles` - User authentication and roles
- `employees` - Employee-specific data
- `inventory_items` - Product catalog (244+ items)
- `product_categories` - Product organization
- `suppliers` - Supplier management
- `guests` - Customer profiles
- `bookings` - Accommodation bookings
- `orders` - Store orders
- `payments` - Payment tracking

### **Financial Tables**
- `expenses_2025` - Expense tracking
- `employee_salaries_2025` - Payroll management
- `stakeholder_withdrawals_2025` - Owner withdrawals
- `employee_advances` - Staff advances
- `money_denominations` - Cash management

### **Audit & Tracking**
- `audit_logs` - Complete change tracking
- `user_activity_logs` - User activity monitoring
- `login_history` - Login/logout tracking
- `inventory_transactions` - Inventory movement audit
- `inventory_counts` - Monthly counting sessions

## 🚀 **Deployment**

### **Production Environment**
- **Platform**: Vercel
- **Database**: Supabase (Singapore region)
- **Domain**: Custom domain configured
- **SSL**: Automatic HTTPS
- **CDN**: Global edge network

### **Environment Configuration**
- **Development**: Local environment with hot reload
- **Production**: Optimized build with environment variables
- **Database**: Production Supabase instance with RLS

## 📊 **Current Statistics**

- **Total Products**: 244+ inventory items
- **Categories**: 9 product categories
- **Users**: Role-based access system
- **Database Tables**: 20+ tables with proper relationships
- **Security**: Row Level Security on all tables
- **Performance**: Optimized with indexes and constraints

## 🔧 **Development Workflow**

### **Database Migrations**
- **Phase 1**: ✅ User Profiles Migration (COMPLETED)
- **Phase 2**: ✅ Complete Inventory System (COMPLETED)
- **Phase 3**: 🔄 Audit Trails & Enhancements (IN PROGRESS)

### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Git**: Version control with descriptive commits
- **Testing**: Component and integration testing ready

## 📞 **Support & Documentation**

### **Documentation Structure**
- **[Database Guide](./docs/guides/DATABASE_GUIDE.md)** - Schema and management
- **[Security Guide](./docs/guides/SECURITY_GUIDE.md)** - Security best practices
- **[Vercel Deployment Guide](./docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Migration Plan](./docs/migration-plan.md)** - Database migration strategy

### **Reports**
- **[Complete Store & POS System Report](./docs/reports/COMPLETE_STORE_AND_POS_SYSTEM_REPORT.md)**
- **[Final Completion Report](./docs/reports/FINAL_COMPLETION_REPORT.md)**
- **[Inventory Import Report](./docs/reports/INVENTORY_IMPORT_REPORT.md)**

## 🎯 **Next Steps**

### **Immediate Priorities**
1. **Complete Phase 3 migrations** (Audit trails, soft deletes, indexes)
2. **Implement advanced reporting dashboard**
3. **Add email notification system**
4. **Optimize performance** for large datasets

### **Future Roadmap**
1. **Mobile app development** (PWA)
2. **Advanced analytics** and business intelligence
3. **Multi-location support**
4. **API integrations** (payment gateways, SMS)

## 🤝 **Contributing**

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comprehensive documentation
- Test thoroughly before deployment

### **Database Guidelines**
- Use UUID for all primary keys
- Implement proper foreign key relationships
- Add Row Level Security policies
- Include audit trails for critical operations
- Use appropriate data types (DATE, NUMERIC, etc.)

---

## 📄 **License**

This project is proprietary software developed specifically for San Pedro Beach Resort. All rights reserved.

---

**Last Updated:** January 27, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Database Migration:** Phase 2 Complete, Phase 3 In Progress

**Built with ❤️ for San Pedro Beach Resort**  
*Transforming hospitality operations through technology while preserving the personal touch that makes your resort special.*
