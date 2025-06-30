# PitchLine B2B SaaS Platform Architecture

## Tech Stack Selection

**Backend:**
- Node.js + Express.js (rapid development, great ecosystem)
- PostgreSQL (ACID compliance for payments, complex relationships)
- Prisma ORM (type-safe database operations)
- JWT for authentication
- Stripe for payments
- Socket.io for real-time features

**Frontend:**
- React 18 + TypeScript
- Vite (fast build tool)
- Tailwind CSS (rapid styling)
- React Query (state management & API calls)
- React Router (navigation)
- Zustand (lightweight state management)

**Infrastructure:**
- Docker for containerization
- Environment-based configuration
- RESTful API design

## Database Schema

### Core Entities

```sql
-- Users table (both Pitchers and Decision Makers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('pitcher', 'decision_maker', 'admin') NOT NULL,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255), -- For Decision Makers (Connect accounts)
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_status ENUM('none', 'active', 'cancelled') DEFAULT 'none',
  subscription_stripe_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Decision Maker profiles
CREATE TABLE decision_maker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  industry VARCHAR(100),
  bio TEXT,
  expertise_areas TEXT[], -- Array of strings
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2) DEFAULT 100.00, -- $100 default
  avatar_url TEXT,
  linkedin_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Availability slots for Decision Makers
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_maker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings/Sessions
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitcher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  decision_maker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
  amount_charged DECIMAL(10,2) NOT NULL, -- Amount charged to pitcher
  platform_fee DECIMAL(10,2) NOT NULL, -- 10% fee
  decision_maker_payout DECIMAL(10,2) NOT NULL, -- 90% payout
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255), -- Transfer to Decision Maker
  meeting_link TEXT, -- Zoom/Google Meet link or in-app room ID
  notes TEXT, -- Pitcher's notes about the pitch
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews system
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  reduced_fee_percentage DECIMAL(5,2), -- e.g., 5.00 for 5%
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) NOT NULL,
  status ENUM('active', 'cancelled', 'past_due') NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type ENUM('booking_confirmed', 'booking_cancelled', 'payment_received', 'review_received') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- Additional data
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users & Profiles
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/decision-makers` - Browse Decision Makers (public)
- `GET /api/decision-makers/:id` - Get Decision Maker profile
- `PUT /api/decision-makers/profile` - Update DM profile (DM only)

### Availability
- `GET /api/availability/:dmId` - Get DM availability
- `POST /api/availability` - Set availability (DM only)
- `PUT /api/availability/:id` - Update availability slot
- `DELETE /api/availability/:id` - Remove availability slot

### Bookings
- `POST /api/bookings` - Create booking (Pitcher)
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id/confirm` - Confirm booking (DM)
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/complete` - Mark as completed

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history
- `POST /api/subscriptions/create` - Create subscription
- `PUT /api/subscriptions/cancel` - Cancel subscription

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:userId` - Get user reviews
- `GET /api/bookings/:bookingId/reviews` - Get booking reviews

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/analytics` - Platform analytics
- `PUT /api/admin/users/:id/verify` - Verify user

## Frontend Architecture

### Pages Structure
```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── pitcher/
│   │   ├── Dashboard.tsx
│   │   ├── BrowseDecisionMakers.tsx
│   │   ├── BookingFlow.tsx
│   │   └── BookingHistory.tsx
│   ├── decision-maker/
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── Availability.tsx
│   │   └── Earnings.tsx
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   └── Analytics.tsx
│   └── shared/
│       ├── Profile.tsx
│       ├── Reviews.tsx
│       └── VideoCall.tsx
```

### Key Features Implementation

**1. Booking Flow:**
- Calendar component showing DM availability
- Real-time slot booking with conflict prevention
- Stripe payment integration
- Email confirmations

**2. Video Integration:**
- Generate unique room IDs for each booking
- Integrate with Zoom API OR build simple WebRTC solution
- Automatic meeting links in confirmation emails

**3. Payment Processing:**
- Stripe Connect for Decision Makers
- Automatic fee calculation (10% platform fee)
- Subscription handling for reduced fees
- Payout automation after completed calls

**4. Real-time Features:**
- Socket.io for booking notifications
- Live availability updates
- In-app messaging during calls

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control
3. **Payment Security**: PCI compliance via Stripe
4. **Data Protection**: Input validation, SQL injection prevention
5. **Rate Limiting**: API endpoint protection
6. **CORS**: Proper cross-origin setup

## Deployment Strategy

1. **Development**: Local Docker setup
2. **Staging**: Cloud deployment with test Stripe keys
3. **Production**: Scalable cloud infrastructure
4. **Database**: PostgreSQL with automated backups
5. **File Storage**: Cloud storage for avatars/documents
6. **Monitoring**: Application and error monitoring

## MVP Priorities

**Phase 1 (Core MVP):**
1. User authentication and basic profiles
2. Decision Maker browsing and booking
3. Basic payment processing
4. Simple dashboard for both roles

**Phase 2 (Enhanced Features):**
1. Advanced scheduling and availability
2. Review system
3. Video call integration
4. Admin panel

**Phase 3 (Scale Features):**
1. Subscription plans
2. Advanced analytics
3. Mobile optimization
4. Advanced admin features

This architecture provides a solid foundation for rapid development while maintaining scalability and clean code structure.