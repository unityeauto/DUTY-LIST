# Setup Guide

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Node.js 18+** installed
3. **npm** package manager

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Enter project details and create the project
4. Wait for project initialization (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbG...`)

## Step 3: Configure Environment Variables

1. Open `/workspaces/DUTY-LIST/.env.local` in this project
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
```

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Run each migration file in order:
   - First: `supabase/migrations/0001_init.sql` (copy entire file and run)
   - Second: `supabase/migrations/0002_rls.sql`
   - Third: `supabase/migrations/0003_seed_schedules.sql`

Alternatively, if you have Supabase CLI installed:
```bash
supabase db push
```

## Step 5: Create Admin User

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: `admin@example.com` (or your preferred email)
   - **Password**: `admin123` (choose a secure password)
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create user**

## Step 6: Set User Role to Admin

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query (replace the email if you used a different one):

```sql
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

## Step 7: Install Dependencies and Run

```bash
npm install
npm run dev
```

## Step 8: Login

1. Open your browser to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Login with:
   - Email: `admin@example.com` (or whatever you created)
   - Password: `admin123` (or whatever you set)

## Troubleshooting

### "Invalid Server Actions request" error
- Fixed: We've migrated from `middleware.ts` to `proxy.ts` for Next.js 16
- Fixed: Added `allowedOrigins` in `next.config.ts` for GitHub Codespaces

### Blank page after login
- Check browser console for errors
- Verify your `.env.local` has the correct Supabase credentials (not placeholder values)
- Verify the user exists in Supabase Dashboard → Authentication → Users
- Verify the user has a profile with a valid role in Database → Table Editor → profiles

### "Cannot use 'in' operator to search for 'headCacheNode' in null"
- This means the profile data is null - run the SQL query in Step 6 to set the role

### Migration errors
- Make sure to run migrations in order: 0001 → 0002 → 0003
- Check the Supabase SQL Editor logs for specific error messages

## Database Schema Overview

- **profiles** - User profiles with role (admin/supervisor)
- **drivers** - Bus drivers with batch numbers
- **buses** - Volvo buses with registration numbers
- **duty_schedules** - Predefined duty schedules (49 schedules seeded)
- **schedule_trips** - Trips within each schedule
- **duty_assignments** - Daily assignments linking schedule + bus + driver

## Next Steps

After successful login as admin:

1. Navigate to **Admin** → **Drivers** to add drivers
2. Navigate to **Admin** → **Buses** to add buses
3. Navigate to **Duty Allocation** to assign duties
4. View **Attendance** to see derived attendance from assignments
5. Use **Export Report** to generate WhatsApp-shareable daily reports

## Creating a Supervisor User

Once logged in as admin:

1. In Supabase Dashboard → Authentication → Users, create another user
2. Run SQL to set their role to 'supervisor':

```sql
UPDATE profiles 
SET role = 'supervisor', full_name = 'Supervisor Name'
WHERE id = (SELECT id FROM auth.users WHERE email = 'supervisor@example.com');
```

Supervisors can:
- View all data (drivers, buses, schedules)
- Create/edit/delete duty assignments
- View attendance reports
- Export daily reports

Supervisors **cannot**:
- Add/edit/delete drivers, buses, or schedules (admin only)
