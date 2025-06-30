# PitchLine - B2B SaaS Platform

A platform connecting **Pitchers** with **Decision Makers** for 15-minute paid pitch calls.

## Features

- **Dual User Roles**: Pitchers book calls, Decision Makers offer expertise
- **Secure Authentication**: JWT-based auth with role-based access control
- **Payment Processing**: Stripe integration with 10% platform fee
- **Booking System**: Calendar-based scheduling with availability management
- **Review System**: 5-star ratings and comments after calls
- **Admin Panel**: User management and analytics
- **Real-time Updates**: Socket.io for live notifications

## Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Stripe Payments
- Socket.io for real-time features

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- React Query for state management
- Zustand for auth state
- React Router for navigation

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for database)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd pitchline-platform

# Install dependencies for both backend and frontend
npm run setup
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Setup Backend

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration (see setup instructions below)

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Servers

```bash
# From project root - starts both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## Environment Setup

### Required Environment Variables

1. **Database**: Already configured for Docker Compose
2. **JWT Secret**: Update `JWT_SECRET` with a secure random string
3. **Stripe Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - `STRIPE_SECRET_KEY`: Test secret key (sk_test_...)
   - `STRIPE_PUBLISHABLE_KEY`: Test publishable key (pk_test_...)

### Optional Configuration

- **Email**: Configure SMTP for notifications
- **Zoom API**: For video call integration
- **AWS S3**: For file uploads

## Test Accounts

After running the seed script, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pitchline.com | admin123 |
| Decision Maker | john.doe@techcorp.com | password123 |
| Decision Maker | sarah.wilson@fintech.com | password123 |
| Pitcher | jane.smith@startup.com | password123 |

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Core Features
- `GET /api/users/decision-makers` - Browse decision makers
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `POST /api/payments/create-intent` - Payment processing

## Database Schema

Key entities:
- **Users**: Both pitchers and decision makers
- **DecisionMakerProfiles**: Extended profiles for experts
- **Bookings**: Scheduled calls with payment tracking
- **Reviews**: Post-call feedback system
- **AvailabilitySlots**: Decision maker availability

## Business Logic

### Pricing Model
- **Base Rate**: $100 per 15-minute call
- **Platform Fee**: 10% (pitcher pays $100, DM receives $90)
- **Premium Subscription**: $29/month for 5% platform fee

### Booking Flow
1. Pitcher browses decision makers
2. Selects available time slot
3. Payment processed via Stripe
4. Both parties receive confirmation
5. Video call link generated
6. Post-call review system

## Development

### Available Scripts

```bash
# Project-wide
npm run dev          # Start both backend and frontend
npm run build        # Build both applications
npm run setup        # Install all dependencies

# Backend only
npm run dev:backend  # Start backend in development
npm run build:backend # Build backend
cd backend && npm run db:migrate  # Run database migrations
cd backend && npm run db:seed     # Seed database

# Frontend only  
npm run dev:frontend  # Start frontend in development
npm run build:frontend # Build frontend
```

### Project Structure

```
pitchline-platform/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, error handling
│   │   ├── prisma/          # Database schema & seed
│   │   └── index.ts         # Express app entry
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-specific pages
│   │   ├── store/           # State management
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml       # Database services
└── README.md
```

## Production Deployment

### Environment Considerations
- Use production Stripe keys
- Set strong JWT secrets
- Configure proper CORS origins
- Enable SSL/HTTPS
- Set up monitoring and logging

### Recommended Stack
- **Backend**: Railway, Heroku, or AWS ECS
- **Database**: AWS RDS, Railway Postgres
- **Frontend**: Vercel, Netlify
- **File Storage**: AWS S3 or Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` folder
- Review the API endpoints in the backend routes

---

**Ready to connect pitchers with decision makers!** 🚀