# CLAUDE.md

## Project

**Volvo Bus Duty Allocation & Automatic Attendance PWA** — a digital replacement for an Excel-based daily bus duty allocation workflow. Admin maintains master data (drivers, buses, predefined duty schedules with trips). Supervisor's daily job is minimal: pick a **Bus** and a **Driver** for each predefined schedule on a date. Everything else (schedule number, return code, trip times, routes, kilometers) comes from the predefined schedule. Attendance, reports, dashboard, and a WhatsApp-shareable PNG/JPG daily report all derive from duty assignments.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Server Actions) in `src/`
- **Supabase** — Auth (email/password) + Postgres + RLS via `@supabase/supabase-js` + `@supabase/ssr`
- **Tailwind CSS v4** + **shadcn/ui** components in `src/components/ui/`
- **TanStack Table v8** for all data tables (shared wrapper in `src/components/data-table.tsx`)
- **React Hook Form + Zod** for all forms; Zod schemas in `src/lib/validations/` are shared between client forms and server actions
- **Recharts** for charts
- **html-to-image** for PNG/JPG report export; Web Share API for WhatsApp sharing
- PWA: `src/app/manifest.ts` + hand-written service worker `public/sw.js`

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build — must pass before committing
npm run lint     # eslint
```

Supabase is a hosted project (no local instance). Env vars in `.env.local` (see `.env.example`):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Never** use or expose the service-role key in this app.

## Database (supabase/migrations/)

- `profiles` — mirrors auth.users; `role` is `'admin' | 'supervisor'`; auto-created by trigger
- `drivers` — `batch_number` unique (e.g. `DT-313`), `name`, `mobile`, `is_active`
- `buses` — `bus_number` unique (e.g. `GJ-16-AY-3755`), `is_active`
- `duty_schedules` — `schedule_number` unique, `return_code`, `total_km`, `is_active`
- `schedule_trips` — FK → duty_schedules (cascade), `trip_sequence`, `start_time`, `route_name`
- `duty_assignments` — `duty_date` + FKs to schedule/bus/driver; unique on `(duty_date, schedule_id)`, `(duty_date, driver_id)`, `(duty_date, bus_id)`

Attendance is **derived, never stored**: a driver with ≥1 assignment on a date is Present, else Absent. Query helpers live in `src/lib/queries/`.

The 49 real-world schedules from the original Excel sheet are seeded in `supabase/migrations/0003_seed_schedules.sql` — they are ordinary rows, fully editable by Admin.

## Security Model

- RLS enabled on every table. Role checks use the `get_my_role()` security-definer function.
- **Admin**: full CRUD on everything. **Supervisor**: read everything; write only `duty_assignments`.
- Every mutation goes through a server action in `src/lib/actions/` that (1) validates with Zod, (2) checks role, (3) relies on RLS + DB constraints as the final backstop.
- Middleware (`src/middleware.ts`) refreshes the Supabase session and redirects unauthenticated users to `/login`. `/admin/*` additionally requires the admin role (checked in the layout).

## Business Rules (do not break these)

1. **Supervisor minimal input**: on the duty allocation page the supervisor only ever selects Bus + Driver. Never ask them to enter schedule/route/time/KM data.
2. **Conflict rule**: one schedule per driver per day, one schedule per bus per day (enforced by server action pre-check AND unique constraints; catch Postgres error `23505` and show a friendly message).
3. Inactive drivers/buses/schedules cannot receive **new** assignments, but historical assignments stay intact.
4. Drivers/buses with historical assignments are never hard-deleted — deactivate instead. Delete is only offered when no assignments reference them.
5. Duty assignment writes require an active connection (no offline mutation queue) so conflict checks always use fresh data. The service worker must never cache POST/server-action requests.
6. Attendance = derived from `duty_assignments`. No manual attendance entry anywhere.

## Conventions

- Server components fetch data; client components handle interactivity. Mutations via server actions only (no API routes except where a route handler is strictly required).
- Dates are handled as `YYYY-MM-DD` strings at the DB boundary (`duty_date` is a Postgres `date`); format for display with `date-fns`.
- Trip lists are always rendered sorted by `trip_sequence`.
- Friendly error messages name the entity: e.g. `Driver DT-313 is already assigned to a duty on this date.`
- UI language is English; design is mobile-first (supervisors use phones). Primary accent is deep navy/blue, echoing the original Excel sheet header.
