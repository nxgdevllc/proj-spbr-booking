# San Pedro Beach Resort - Management System

A comprehensive web-based booking and management system for San Pedro Beach Resort in Opal, Philippines (Cal de Oro).

## 📋 Project Overview

This system transforms manual, Google Sheets-based resort operations into a modern, automated management platform optimized for mobile devices and integrated with thermal receipt printers and barcode scanners.

### Key Features
- **Mobile-First Design**: Optimized for Android phones/tablets
- **Booking Management**: Guest check-in/check-out with receipt printing
- **Payment Processing**: Cash and GCash integration
- **Inventory Management**: Barcode scanning and stock tracking
- **Financial Management**: Automated reporting and reconciliation
- **Employee Management**: Task assignment and scheduling
- **Customer Portal**: Online booking and self-service (future)

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: Next.js 14 with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: Supabase Auth with RLS
- **Integrations**: Web Bluetooth API for printers/scanners

### Domain Structure
- **Main Website**: `sanpedrobeachresort.com`
- **Admin Dashboard**: `admin.sanpedrobeachresort.com`

## 📚 Documentation

### Core Documents
- **[PROJECT_BRIEF.md](./PROJECT_BRIEF.md)** - Complete project overview and requirements
- **[DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql)** - Supabase database schema
- **[TECHNICAL_STACK.md](./TECHNICAL_STACK.md)** - Technology choices and architecture
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Phased development plan
- **[DATA_MIGRATION_PLAN.md](./DATA_MIGRATION_PLAN.md)** - Google Sheets to Supabase migration
- **[RECOMMENDATIONS.md](./RECOMMENDATIONS.md)** - System improvements and optimizations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account
- Android device (8.0+) with Chrome browser

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-username/spbr-booking.git
cd spbr-booking

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GCASH_API_KEY=your_gcash_api_key
RESEND_API_KEY=your_resend_api_key
```

## 📱 Hardware Requirements

### Recommended Devices
- **Primary**: Samsung Galaxy Tab S9+ or iPad Pro 11"
- **Backup**: Mid-range Android phone (Samsung A54 or similar)

### Peripherals
- **Thermal Printer**: Epson TM-P80 WiFi (80mm paper)
- **Barcode Scanner**: Zebra CS4070-SR (Bluetooth)
- **Network**: Fiber internet + 4G backup
- **Power**: UPS system for continuous operation

## 🔄 Development Phases

### Phase 1: Core MVP (4-6 weeks) ✅
- [x] Authentication and user management
- [x] Basic booking system
- [x] Guest check-in/check-out
- [x] Payment processing (cash/GCash)
- [x] Thermal receipt printing
- [x] Mobile-responsive interface

### Phase 2: Enhanced Operations (3-4 weeks)
- [ ] Financial reporting and reconciliation
- [ ] Employee task management
- [ ] Basic inventory management
- [ ] Barcode scanning integration

### Phase 3: Advanced Features (4-5 weeks)
- [ ] Customer self-service portal
- [ ] Online booking system
- [ ] Advanced analytics dashboard
- [ ] Automated communications

### Phase 4: Optimization (2-3 weeks)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation and training
- [ ] Production deployment

## 💰 Cost Structure

### Monthly Operating Costs
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Domain & SSL**: $1.25/month
- **Third-party APIs**: $30-50/month
- **Total**: ~$75-95/month

### Development Investment
- **Phase 1**: 4-6 weeks (Core MVP)
- **Phase 2-4**: 9-13 weeks (Full system)
- **Total**: 13-19 weeks for complete platform

## 📊 Key Performance Indicators

### Operational Efficiency
- 50% reduction in check-in time
- 90% accuracy in financial reporting
- 100% digital receipt generation
- Real-time inventory tracking

### Business Impact
- Automated daily reconciliation
- Reduced manual errors by 90%
- Improved customer experience
- Scalable for resort expansion

## 🔐 Security Features

- **Data Encryption**: AES-256 encryption at rest and in transit
- **Authentication**: Multi-factor authentication support
- **Access Control**: Role-based permissions (Admin, Manager, Employee)
- **Audit Trail**: Complete transaction logging
- **Compliance**: GDPR and Philippine Data Privacy Act compliant

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Offline Mode**: Critical operations work without internet
- **Native Feel**: Add to home screen, full-screen mode
- **Push Notifications**: Booking alerts and reminders
- **Camera Access**: Manual barcode entry fallback

### Bluetooth Integration
- **Thermal Printing**: ESC/POS command support
- **Barcode Scanning**: 1D and 2D barcode support
- **Device Management**: Automatic reconnection and error handling

## 🌱 Sustainability Features

### Environmental Monitoring
- Water and electricity usage tracking
- Carbon footprint calculation
- Waste management reporting
- Sustainable practice recommendations

### Resource Optimization
- Digital receipts to reduce paper waste
- Automated systems to reduce energy consumption
- Inventory optimization to minimize waste
- Predictive maintenance to extend equipment life

## 📈 Future Enhancements

### Planned Features
- **AI-Powered Analytics**: Demand forecasting and pricing optimization
- **IoT Integration**: Smart locks, sensors, and automation
- **Multi-Property Support**: Expansion to additional locations
- **Advanced CRM**: Customer relationship management
- **Mobile Apps**: Native iOS and Android applications

### Integration Opportunities
- **Tourism Partners**: Tour operators, restaurants, transportation
- **Government Compliance**: DOT reporting, BIR tax integration
- **Marketing Platforms**: Social media, review sites, booking engines
- **Payment Gateways**: Additional payment methods and currencies

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Testing**: Jest for unit tests, Cypress for E2E tests

## 📞 Support & Contact

### Technical Support
- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Community support via GitHub Discussions

### Business Contact
- **Resort**: San Pedro Beach Resort, Opal, Philippines, Cal de Oro
- **Website**: [sanpedrobeachresort.com](https://sanpedrobeachresort.com)
- **Admin Portal**: [admin.sanpedrobeachresort.com](https://admin.sanpedrobeachresort.com)

## 📄 License

This project is proprietary software developed specifically for San Pedro Beach Resort. All rights reserved.

---

**Built with ❤️ for San Pedro Beach Resort**

*Transforming hospitality operations through technology while preserving the personal touch that makes your resort special.*