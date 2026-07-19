-- Migration: Row Level Security policies
-- Enables RLS on all tables and defines access rules for admin and supervisor roles

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile and other users' names (needed for UI display)
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update profiles
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Drivers policies
-- Everyone authenticated can read drivers
CREATE POLICY "Authenticated users can read drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert drivers
CREATE POLICY "Admins can insert drivers"
  ON drivers FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can update drivers
CREATE POLICY "Admins can update drivers"
  ON drivers FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can delete drivers
CREATE POLICY "Admins can delete drivers"
  ON drivers FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Buses policies
-- Everyone authenticated can read buses
CREATE POLICY "Authenticated users can read buses"
  ON buses FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert buses
CREATE POLICY "Admins can insert buses"
  ON buses FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can update buses
CREATE POLICY "Admins can update buses"
  ON buses FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can delete buses
CREATE POLICY "Admins can delete buses"
  ON buses FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Duty schedules policies
-- Everyone authenticated can read schedules
CREATE POLICY "Authenticated users can read duty_schedules"
  ON duty_schedules FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert schedules
CREATE POLICY "Admins can insert duty_schedules"
  ON duty_schedules FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can update schedules
CREATE POLICY "Admins can update duty_schedules"
  ON duty_schedules FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can delete schedules
CREATE POLICY "Admins can delete duty_schedules"
  ON duty_schedules FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Schedule trips policies
-- Everyone authenticated can read trips
CREATE POLICY "Authenticated users can read schedule_trips"
  ON schedule_trips FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert trips
CREATE POLICY "Admins can insert schedule_trips"
  ON schedule_trips FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can update trips
CREATE POLICY "Admins can update schedule_trips"
  ON schedule_trips FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Only admins can delete trips
CREATE POLICY "Admins can delete schedule_trips"
  ON schedule_trips FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Duty assignments policies
-- Everyone authenticated can read assignments
CREATE POLICY "Authenticated users can read duty_assignments"
  ON duty_assignments FOR SELECT
  TO authenticated
  USING (true);

-- Both admin and supervisor can insert assignments
CREATE POLICY "Admin and supervisor can insert duty_assignments"
  ON duty_assignments FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'supervisor'));

-- Both admin and supervisor can update assignments
CREATE POLICY "Admin and supervisor can update duty_assignments"
  ON duty_assignments FOR UPDATE
  TO authenticated
  USING (get_my_role() IN ('admin', 'supervisor'))
  WITH CHECK (get_my_role() IN ('admin', 'supervisor'));

-- Both admin and supervisor can delete assignments
CREATE POLICY "Admin and supervisor can delete duty_assignments"
  ON duty_assignments FOR DELETE
  TO authenticated
  USING (get_my_role() IN ('admin', 'supervisor'));
