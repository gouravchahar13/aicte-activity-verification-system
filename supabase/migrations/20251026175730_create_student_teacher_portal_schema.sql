/*
  # Student-Teacher Project Portal Database Schema

  ## Overview
  This migration creates the complete database structure for a Student-Teacher Project Portal
  where students can submit projects and teachers can review and approve them.

  ## New Tables

  ### 1. `profiles`
  Stores user profile information and role
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'student' or 'teacher'
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `projects`
  Stores project submissions from students
  - `id` (uuid, primary key) - Unique project identifier
  - `title` (text) - Project title
  - `student_id` (uuid) - References profiles(id)
  - `file_url` (text) - URL to uploaded project file in storage
  - `file_name` (text) - Original filename
  - `status` (text) - 'pending' or 'approved'
  - `approved_by` (uuid, nullable) - Teacher who approved (references profiles)
  - `submitted_at` (timestamptz) - Submission timestamp
  - `approved_at` (timestamptz, nullable) - Approval timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Profiles: Users can read their own profile; authenticated users can read all profiles
  - Projects: Students can create and view their own projects; teachers can view and update all projects

  ## Storage

  ### Buckets
  - `project-files` bucket for storing uploaded project documents

  ## Important Notes
  1. Uses auth.uid() for user identification
  2. Restrictive policies ensure data security
  3. Separate policies for SELECT, INSERT, UPDATE operations
  4. Default values set for timestamps and status fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  approved_by uuid REFERENCES profiles(id),
  submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies for students
CREATE POLICY "Students can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

CREATE POLICY "Students can insert their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

-- Projects policies for teachers
CREATE POLICY "Teachers can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can update project status"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project files
CREATE POLICY "Students can upload their own project files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

CREATE POLICY "Students can view their own project files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Teachers can view all project files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);