# San Pedro Beach Resort - Technical Stack & Architecture

## Technology Stack Overview

### Frontend Framework
**Next.js 14 with App Router**
- **Why**: Full-stack React framework with excellent mobile performance
- **Features**: Server-side rendering, API routes, optimized for mobile
- **Mobile Optimization**: Progressive Web App (PWA) capabilities
- **Offline Support**: Service workers for critical operations

### UI Framework & Styling
**Tailwind CSS + Headless UI**
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Headless UI**: Unstyled, accessible UI components
- **Mobile-First**: Responsive design optimized for Android devices
- **Touch-Friendly**: Large touch targets, swipe gestures

### Database & Backend
**Supabase (PostgreSQL)**
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Built-in auth with role-based access
- **Storage**: File storage for receipts and documents
- **Edge Functions**: Serverless functions for business logic
- **Real-time**: Live updates for booking status, inventory

### Deployment & Hosting
**Vercel Platform**
- **Hosting**: Global CDN with edge functions
- **Domain**: sanpedrobeachresort.com
- **SSL**: Automatic HTTPS certificates
- **Performance**: Optimized for mobile connections
- **Scaling**: Automatic scaling based on demand

## Mobile Integration Architecture

### Android Device Support
```
Android Phone/Tablet (Chrome Browser)
├── PWA Installation (Add to Home Screen)
├── Offline Capability (Service Workers)
├── Bluetooth Integration
│   ├── Thermal Printer Connection
│   └── Barcode Scanner Connection
└── Native-like Experience
    ├── Full-screen mode
    ├── Push notifications
    └── Camera access (for manual barcode entry)
```

### Bluetooth Device Integration
**Thermal Printer Integration**
- **API**: Web Bluetooth API
- **Protocol**: ESC/POS commands
- **Paper Size**: 80mm thermal paper
- **Features**: Text formatting, logos, QR codes
- **Fallback**: Email receipts if printer unavailable

**Barcode Scanner Integration**
- **API**: Web Bluetooth API
- **Types**: 1D and 2D barcode support
- **Modes**: Continuous scan, single scan
- **Fallback**: Camera-based scanning using device camera

### Progressive Web App (PWA) Features
```javascript
// Service Worker for Offline Support
const CACHE_NAME = 'spbr-v1';
const OFFLINE_URLS = [
  '/dashboard',
  '/checkin',
  '/inventory',
  '/offline-fallback'
];

// Critical offline functionality
- Guest check-in/check-out
- Basic inventory lookup
- Receipt generation
- Data sync when online
```

## API Architecture

### Supabase Edge Functions
```typescript
// Real-time subscriptions
const bookingUpdates = supabase
  .channel('booking_updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    // Update UI in real-time
  })
  .subscribe();

// Authentication & Authorization
const { data: user } = await supabase.auth.getUser();
const userRole = user?.user_metadata?.role;
```

### Third-Party Integrations

#### GCash Payment Integration
```typescript
// GCash API Integration
interface GCashPayment {
  merchantId: string;
  amount: number;
  referenceNumber: string;
  callbackUrl: string;
}

// Payment verification
async function verifyGCashPayment(referenceNumber: string) {
  // Verify payment status with GCash API
  // Update booking payment status
  // Generate receipt
}
```

#### Notification System
```typescript
// Multi-channel notifications
interface NotificationService {
  email: ResendAPI;    // Resend.com for emails
  sms: TwilioAPI;      // Twilio for SMS (optional)
  push: WebPushAPI;    // Browser push notifications
}
```

## Security Architecture

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → Role-based Access
├── Admin: Full system access
├── Manager: Financial reports, employee management
├── Employee: Daily operations, basic reports
└── Guest: Limited self-service portal (future)
```

### Data Security
- **Encryption**: All data encrypted in transit and at rest
- **RLS**: Row Level Security for data isolation
- **Audit Trail**: All transactions logged with user attribution
- **Backup**: Automated daily backups with point-in-time recovery

### Payment Security
- **PCI Compliance**: Following PCI DSS guidelines
- **Tokenization**: Payment references stored, not card details
- **Audit Logs**: All payment transactions logged
- **Fraud Detection**: Unusual pattern detection

## Performance Optimization

### Mobile Performance
```typescript
// Code splitting for mobile
const CheckinModule = lazy(() => import('./components/Checkin'));
const InventoryModule = lazy(() => import('./components/Inventory'));

// Image optimization
import Image from 'next/image';
// Automatic WebP conversion, lazy loading

// Bundle size optimization
// Tree shaking, dynamic imports
// Service worker caching
```

### Database Optimization
```sql
-- Strategic indexing for common queries
CREATE INDEX idx_bookings_checkin_status ON bookings(check_in_date, status);
CREATE INDEX idx_inventory_low_stock ON products(current_stock, reorder_level);
CREATE INDEX idx_sales_daily ON sales(DATE(sale_date));

-- Materialized views for reports
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT DATE(created_at) as date, SUM(amount) as revenue
FROM payments WHERE status = 'completed'
GROUP BY DATE(created_at);
```

## Development Workflow

### Environment Setup
```bash
# Local development
npm install
npm run dev

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GCASH_API_KEY=your_gcash_key
RESEND_API_KEY=your_resend_key
```

### Deployment Pipeline
```yaml
# Vercel deployment
name: Deploy to Production
on:
  push:
    branches: [main]
steps:
  - uses: actions/checkout@v2
  - name: Deploy to Vercel
    uses: amondnet/vercel-action@v20
    with:
      vercel-token: ${{ secrets.VERCEL_TOKEN }}
      vercel-org-id: ${{ secrets.ORG_ID }}
      vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Hardware Specifications

### Recommended Android Devices
- **OS**: Android 8.0+ (API level 26+)
- **Browser**: Chrome 80+ (for Web Bluetooth support)
- **RAM**: 3GB+ for smooth operation
- **Storage**: 32GB+ with sufficient app cache space
- **Screen**: 5.5"+ for comfortable use
- **Connectivity**: WiFi + 4G/5G backup

### Thermal Printer Requirements
- **Connection**: Bluetooth 4.0+
- **Paper**: 80mm thermal paper rolls
- **Protocol**: ESC/POS command support
- **Features**: Text formatting, basic graphics
- **Recommended Models**:
  - Epson TM-P80
  - Star Micronics SM-L200
  - Bixolon SPP-R200III

### Barcode Scanner Requirements
- **Connection**: Bluetooth 4.0+
- **Types**: 1D/2D barcode support
- **Battery**: 8+ hours continuous use
- **Durability**: IP54 rating for resort environment
- **Recommended Models**:
  - Zebra CS4070
  - Honeywell Voyager 1602g
  - Socket Mobile S700

## Monitoring & Analytics

### Application Monitoring
```typescript
// Error tracking with Sentry
import * as Sentry from "@sentry/nextjs";

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Custom analytics
const trackEvent = (event: string, properties: object) => {
  // Track user interactions
  // Monitor business metrics
  // Performance analytics
};
```

### Business Intelligence
```sql
-- Key Performance Indicators (KPIs)
-- Daily revenue tracking
-- Occupancy rates
-- Average daily rate (ADR)
-- Revenue per available room (RevPAR)
-- Guest satisfaction metrics
-- Employee productivity metrics
```

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **Files**: Supabase Storage with cross-region replication
- **Code**: Git repository with automated deployments
- **Configuration**: Environment variables in Vercel

### Business Continuity
- **Offline Mode**: Critical operations continue without internet
- **Data Sync**: Automatic synchronization when connection restored
- **Failover**: Multiple deployment regions for high availability
- **Recovery**: Point-in-time recovery for data corruption

## Cost Structure

### Monthly Operational Costs
```
Vercel Pro Plan:        $20/month
Supabase Pro Plan:      $25/month
Domain Registration:    $1.25/month
Resend Email API:       $20/month (1M emails)
Twilio SMS (optional):  $30/month
Total:                  $96.25/month
```

### Development Tools (One-time/Annual)
```
Figma Pro:             $144/year (design)
Sentry Error Tracking: $26/month
Analytics Tools:       $0 (Google Analytics)
```

This technical stack provides a robust, scalable foundation for the San Pedro Beach Resort management system, optimized for mobile use while maintaining enterprise-grade security and performance standards.