# Volvo Bus Daily Duty Allocation and Automatic Attendance PWA

A modern, responsive Progressive Web App for managing daily Volvo bus duty allocation and automatic driver attendance. This application replaces the manual Excel-based duty allocation process with a secure, mobile-friendly digital solution.

## Features

- **Role-based Authentication**: Secure login for Admin and Supervisor users
- **Master Data Management**: Manage drivers, buses, and duty schedules
- **Daily Duty Allocation**: Quick assignment of buses and drivers to predefined schedules
- **Automatic Attendance**: Attendance automatically calculated from duty assignments
- **Conflict Prevention**: Real-time validation prevents overlapping assignments
- **Comprehensive Reports**: Daily, monthly, driver-wise, and route-wise analysis
- **Live Dashboard**: Operational metrics and today's assignments at a glance
- **PWA Support**: Installable on mobile devices, works offline
- **WhatsApp Integration**: Export final duty reports as PNG/JPG for sharing

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table with sorting, filtering, and pagination
- **Charts**: Recharts for analytics
- **PWA**: Service Worker, Web App Manifest

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier is sufficient for development)

## 🚀 Quick Start

**First time setup?** See **[SETUP.md](./SETUP.md)** for complete step-by-step instructions.

1. **Configure Supabase credentials** in `.env.local` (copy from `.env.example`)
2. **Run database migrations** in Supabase SQL Editor
3. **Create an admin user** via Supabase Dashboard
4. **Install and run:**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your admin credentials.

⚠️ **Important**: Do NOT run `npm run dev` until you've completed steps 1-3 in SETUP.md. The app requires valid Supabase credentials to function.

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned (2-3 minutes)
3. Go to **Project Settings** > **API** and copy:
   - Project URL
   - Anon/Public key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Run Database Migrations

1. In the Supabase dashboard, go to **SQL Editor**
2. Run the migrations in order:
   - `supabase/migrations/0001_init.sql` - Creates tables and triggers
   - `supabase/migrations/0002_rls.sql` - Enables Row Level Security
   - `supabase/migrations/0003_seed_schedules.sql` - Seeds all 49 duty schedules from the Excel sheet

### 5. Create Initial Users

1. In Supabase dashboard, go to **Authentication** > **Users**
2. Click **Add User** and create an admin user:
   - Email: `admin@example.com`
   - Password: (choose a secure password)
3. Create a supervisor user:
   - Email: `supervisor@example.com`
   - Password: (choose a secure password)
4. Note the UUID for each user
5. In SQL Editor, run (replace UUIDs with actual values):
   ```sql
   UPDATE profiles SET role = 'admin', full_name = 'Admin User'
   WHERE id = 'uuid-from-auth-users';

   UPDATE profiles SET role = 'supervisor', full_name = 'Supervisor User'
   WHERE id = 'uuid-from-auth-users';
   ```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Login and Test

- Login with the admin account to access all features
- Login with the supervisor account to test duty allocation workflow

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (app)/              # Protected app routes
│   │   ├── dashboard/      # Dashboard
│   │   ├── duty-allocation/# Daily duty allocation
│   │   ├── attendance/     # Attendance reports
│   │   ├── reports/        # Various reports
│   │   ├── report-export/  # PNG/JPG export
│   │   └── admin/          # Admin-only master data management
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── app-nav.tsx         # Navigation component
├── lib/
│   ├── actions/            # Server actions
│   ├── supabase/           # Supabase client configuration
│   ├── validations/        # Zod schemas
│   └── queries/            # Database queries
└── middleware.ts           # Auth middleware

supabase/
└── migrations/             # Database migrations
```

## Implementation Phases

The application is being built in phases:

### ✅ Phase 1: Authentication and Access Control
- Secure login/logout
- Role-based access (Admin, Supervisor)
- Protected routes

### 🚧 Phase 2: Master Data Management (Next)
- Drivers CRUD
- Buses CRUD
- Active/Inactive status

### 📋 Phase 3: Duty Schedule and Trip Setup
- Schedule management
- Trip configuration
- Multi-trip schedules

### 📋 Phase 4-5: Daily Duty Allocation & Conflict Prevention
- Date-based allocation
- Bus and driver assignment
- Overlap detection

### 📋 Phase 6: Automatic Attendance
- Derived from duty assignments
- Present/Absent calculation

### 📋 Phase 7: Reports and Analysis
- Daily attendance report
- Monthly attendance summary
- Driver-wise analysis
- Route-wise analysis

### 📋 Phase 8: Dashboard
- Live operational metrics
- Today's duty summary

### 📋 Phase 9: PWA & Security Hardening
- Service worker
- Offline support
- App installation
- Mobile optimization

### 📋 Phase 10: Report Export
- PNG/JPG generation
- WhatsApp sharing
- Multi-page reports

## Database Schema

### Key Tables

- **profiles**: User profiles with roles (admin, supervisor)
- **drivers**: Driver information (batch_number, name, mobile, is_active)
- **buses**: Bus information (bus_number, is_active)
- **duty_schedules**: Predefined schedules (schedule_number, return_code, total_km)
- **schedule_trips**: Trips within schedules (trip_sequence, start_time, route_name)
- **duty_assignments**: Daily assignments (duty_date, schedule_id, bus_id, driver_id)

### Security

- Row Level Security (RLS) enabled on all tables
- Admin: Full access to all data
- Supervisor: Read access to master data, full access to duty assignments and reports
- Database-level authorization prevents unauthorized access

## Core Business Rules

1. **Minimal Supervisor Input**: Supervisor only selects Bus and Driver; all schedule details come from predefined data
2. **Conflict Prevention**: No overlapping assignments for drivers or buses
3. **Automatic Attendance**: Presence derived from duty assignments
4. **Historical Integrity**: Inactive drivers/buses retain historical data

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

## License

Proprietary - Internal use only

## Support

For issues or questions, contact the development team.
