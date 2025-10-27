import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100">
      {/* ===== HEADER ===== */}
      <header className="backdrop-blur-md bg-white/70 sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {profile?.role === 'student' ? (
              <GraduationCap className="w-9 h-9 text-blue-600 drop-shadow-md" />
            ) : (
              <Users className="w-9 h-9 text-green-600 drop-shadow-md" />
            )}
            <div>
              <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-blue-700">
                {profile?.role === 'student' ? 'Student Portal' : 'Teacher Portal'}
              </h1>
              <p className="text-sm text-slate-600">AICTE Activity Verification Portal</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 rounded-xl shadow-sm border border-slate-200 backdrop-blur-md">
              <User className="w-5 h-5 text-slate-600" />
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{profile?.full_name}</p>
                <p className="text-slate-600 text-xs capitalize">{profile?.role}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="mt-16 border-t border-slate-200 backdrop-blur-md bg-white/60 py-6 shadow-inner">
        <p className="text-center text-slate-600 text-sm">
          © 2025 <span className="font-semibold text-slate-800">AICTE Activity Verification Portal</span>. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
