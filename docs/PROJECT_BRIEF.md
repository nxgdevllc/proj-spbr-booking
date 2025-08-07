# San Pedro Beach Resort - Comprehensive Management System
## Project Brief

### Executive Summary
A complete web-based management system for San Pedro Beach Resort in Opal, Philippines (Cal de Oro) that handles booking, check-in/check-out, payments, inventory management, financial tracking, and employee management. The system will be mobile-optimized for Android devices and integrate with thermal receipt printers and barcode scanners.

### Business Context
- **Location**: San Pedro Beach Resort, Opal, Philippines, Cal de Oro
- **Current Operations**: 2-employee operation (day shift + night shift/security)
- **Payment Methods**: GCash for deposits, cash for other transactions
- **Current Data**: Google Sheets-based system
- **Hardware**: Android phones, thermal receipt printers, Bluetooth barcode scanners

### System Components

#### 1. Core Booking & Check-in System
**Primary Features:**
- Guest information collection and management
- Check-in/check-out processing
- Receipt generation (thermal printer compatible)
- Unit availability tracking
- Deposit and payment processing
- GCash integration for deposits
- Cash transaction recording

**User Interface:**
- Mobile-optimized web application
- Android-friendly responsive design
- Offline capability for basic operations
- Touch-friendly interface for phone use

#### 2. Property Management Module
**Features:**
- Unit type management (cottages, rooms, etc.)
- Pricing management
- Availability calendar
- Maintenance scheduling
- Unit status tracking (available, occupied, maintenance, cleaning)

#### 3. Financial Management System
**Components:**
- **Income Tracking**: Automatic booking revenue recording
- **Expense Management**: Vendor payments, utilities, supplies
- **Asset Management**: Property, equipment, inventory valuation
- **Payroll System**: Employee salaries, time tracking
- **Financial Reports**: Daily, weekly, monthly summaries
- **Tax Preparation**: Philippine tax compliance features

#### 4. Employee Management Dashboard
**Features:**
- Task assignment and tracking
- Time-off requests and approval
- Shift scheduling
- Performance tracking
- Communication system
- Training module access

#### 5. Inventory Management System
**Store Management:**
- Barcode scanning integration
- Stock level monitoring
- Automatic reorder alerts
- Supplier management
- Sales tracking
- Integration with financial system

#### 6. Customer Portal (Future Phase)
**Self-Service Features:**
- Online booking system
- Deposit payments via GCash
- Booking modifications
- Digital receipts
- Guest communication

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (React-based)
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: Headless UI / Radix UI
- **PWA**: Service workers for offline functionality
- **Print Integration**: Web Print API for thermal printers

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions
- **Real-time**: Supabase Realtime subscriptions

#### Deployment & Hosting
- **Platform**: Vercel
- **Domain**: sanpedrobeachresort.com
- **Admin Dashboard**: admin.sanpedrobeachresort.com
- **SSL**: Automatic via Vercel
- **CDN**: Global edge network via Vercel

#### Integrations
- **Payment**: GCash API integration
- **Printing**: Web Bluetooth API for thermal printers
- **Barcode**: Web Bluetooth API for barcode scanners
- **Notifications**: Email (Resend) + SMS (Twilio)

### Database Schema Design

#### Core Tables
```sql
-- Users & Authentication
users (id, email, role, name, phone, created_at, updated_at)
employee_profiles (user_id, employee_id, hire_date, salary, position)

-- Property Management
unit_types (id, name, description, base_price, capacity, amenities)
units (id, unit_type_id, unit_number, status, last_maintenance)

-- Booking System
bookings (id, guest_id, unit_id, check_in, check_out, total_amount, status)
guests (id, name, phone, email, id_number, address, emergency_contact)
payments (id, booking_id, amount, method, gcash_reference, receipt_number)

-- Financial System
transactions (id, type, category, amount, description, date, created_by)
expenses (id, category, amount, vendor, receipt_url, date, approved_by)
payroll (id, employee_id, period, base_salary, deductions, net_pay)

-- Inventory System
products (id, name, sku, barcode, price, category, supplier_id)
inventory (id, product_id, quantity, reorder_level, last_restocked)
sales (id, product_id, quantity, unit_price, total, payment_method, sold_by)

-- Task Management
tasks (id, assigned_to, title, description, priority, due_date, status)
time_off_requests (id, employee_id, start_date, end_date, reason, status)
```

### Data Migration Strategy

#### Phase 1: Google Sheets Export
- Export existing data to CSV format
- Clean and normalize data structure
- Map current fields to new database schema

#### Phase 2: Data Import Tool
- Build web-based import interface
- Validate data integrity
- Handle duplicate detection
- Provide import preview and rollback

#### Phase 3: Parallel Operation
- Run both systems temporarily
- Verify data accuracy
- Train staff on new system
- Gradual transition

### Development Phases

#### Phase 1: Core MVP (4-6 weeks)
**Priority Features:**
- Basic booking system
- Guest check-in/check-out
- Receipt generation
- Unit management
- Basic financial tracking
- Employee authentication

**Deliverables:**
- Mobile-responsive web app
- Basic database setup
- Thermal printer integration
- Data migration from sheets

#### Phase 2: Enhanced Operations (3-4 weeks)
**Features:**
- Advanced financial reporting
- Employee task management
- Inventory management basics
- GCash integration
- Barcode scanning

#### Phase 3: Advanced Features (4-5 weeks)
**Features:**
- Customer self-service portal
- Advanced analytics and reporting
- Automated workflows
- Mobile app (if needed)
- Advanced inventory features

#### Phase 4: Optimization & Scaling (2-3 weeks)
**Features:**
- Performance optimization
- Advanced security features
- Backup and disaster recovery
- Staff training and documentation

### Hardware Requirements

#### Recommended Setup
- **Android Tablets/Phones**: Android 8.0+ with Chrome browser
- **Thermal Printer**: Bluetooth-enabled (80mm paper width)
- **Barcode Scanner**: Bluetooth 1D/2D scanner
- **Internet**: Reliable WiFi with 4G backup
- **Backup Power**: UPS for critical operations

### Security & Compliance

#### Data Protection
- GDPR-compliant data handling
- Philippine Data Privacy Act compliance
- Encrypted data transmission (HTTPS)
- Regular automated backups
- Role-based access control

#### Financial Security
- PCI DSS guidelines for payment processing
- Audit trails for all transactions
- Daily reconciliation reports
- Fraud detection mechanisms

### Cost Estimates

#### Monthly Operational Costs
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Domain & SSL**: $15/year
- **Third-party APIs**: $30-50/month
- **Total**: ~$75-95/month

#### Development Investment
- **Phase 1**: 4-6 weeks development
- **Phase 2-3**: 7-9 weeks additional
- **Phase 4**: 2-3 weeks optimization
- **Total**: 13-18 weeks for complete system

### Success Metrics

#### Operational Efficiency
- 50% reduction in check-in time
- 90% accuracy in financial reporting
- 100% digital receipt generation
- Real-time inventory tracking

#### Financial Benefits
- Automated daily reconciliation
- Reduced cash handling errors
- Improved revenue tracking
- Better expense management

### Risk Mitigation

#### Technical Risks
- **Internet Connectivity**: Offline mode for critical operations
- **Device Failure**: Cloud-based system accessible from any device
- **Data Loss**: Automated daily backups to multiple locations
- **Security Breaches**: Multi-factor authentication and encryption

#### Business Risks
- **Staff Training**: Comprehensive training program and documentation
- **System Adoption**: Gradual rollout with parallel operation period
- **Scalability**: Cloud-based architecture for easy scaling

### Next Steps

1. **Immediate Actions:**
   - Set up development environment
   - Create Supabase project
   - Initialize Next.js application
   - Design database schema

2. **Week 1-2:**
   - Implement core booking functionality
   - Set up authentication system
   - Create mobile-responsive UI
   - Begin thermal printer integration

3. **Week 3-4:**
   - Complete check-in/check-out system
   - Implement receipt generation
   - Add basic financial tracking
   - Start data migration planning

This system will transform San Pedro Beach Resort's operations from manual, sheet-based processes to a fully automated, integrated management system that scales with the business while maintaining the personal touch that makes the resort special.