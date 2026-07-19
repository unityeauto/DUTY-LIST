-- Migration: Initial schema for Volvo Bus Duty Allocation
-- Creates all tables, indexes, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (mirrors auth.users with role)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper function to get current user's role (for RLS)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drivers_batch_number ON drivers(batch_number);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);
CREATE INDEX idx_drivers_name ON drivers(name);

-- Buses table
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_number TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buses_bus_number ON buses(bus_number);
CREATE INDEX idx_buses_is_active ON buses(is_active);

-- Duty schedules table
CREATE TABLE duty_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_number TEXT NOT NULL UNIQUE,
  return_code TEXT,
  total_km NUMERIC(8,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_duty_schedules_schedule_number ON duty_schedules(schedule_number);
CREATE INDEX idx_duty_schedules_is_active ON duty_schedules(is_active);

-- Schedule trips table
CREATE TABLE schedule_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES duty_schedules(id) ON DELETE CASCADE,
  trip_sequence INTEGER NOT NULL,
  start_time TIME NOT NULL,
  route_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id, trip_sequence)
);

CREATE INDEX idx_schedule_trips_schedule_id ON schedule_trips(schedule_id);
CREATE INDEX idx_schedule_trips_sequence ON schedule_trips(schedule_id, trip_sequence);

-- Duty assignments table
CREATE TABLE duty_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duty_date DATE NOT NULL,
  schedule_id UUID NOT NULL REFERENCES duty_schedules(id) ON DELETE RESTRICT,
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Conflict prevention: one schedule per date, one driver per date, one bus per date
  UNIQUE(duty_date, schedule_id),
  UNIQUE(duty_date, driver_id),
  UNIQUE(duty_date, bus_id)
);

CREATE INDEX idx_duty_assignments_date ON duty_assignments(duty_date);
CREATE INDEX idx_duty_assignments_schedule ON duty_assignments(schedule_id);
CREATE INDEX idx_duty_assignments_bus ON duty_assignments(bus_id);
CREATE INDEX idx_duty_assignments_driver ON duty_assignments(driver_id);
CREATE INDEX idx_duty_assignments_date_driver ON duty_assignments(duty_date, driver_id);
CREATE INDEX idx_duty_assignments_date_bus ON duty_assignments(duty_date, bus_id);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duty_schedules_updated_at BEFORE UPDATE ON duty_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_trips_updated_at BEFORE UPDATE ON schedule_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duty_assignments_updated_at BEFORE UPDATE ON duty_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
