import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher';
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  student_id: string;
  file_url: string;
  file_name: string;
  status: 'pending' | 'approved';
  approved_by: string | null;
  submitted_at: string;
  approved_at: string | null;
};
