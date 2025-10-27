import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<{
    role: 'student' | 'teacher';
    action: 'login' | 'signup';
  } | null>(null);

  const handleSelectRole = (role: 'student' | 'teacher', action: 'login' | 'signup') => {
    setAuthMode({ role, action });
  };

  const handleBack = () => {
    setAuthMode(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !profile) {
    if (authMode) {
      return <AuthForm role={authMode.role} mode={authMode.action} onBack={handleBack} />;
    }
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  return (
    <Layout>
      {profile.role === 'student' ? <StudentPortal /> : <TeacherPortal />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
