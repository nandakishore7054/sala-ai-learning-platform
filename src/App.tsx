import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onIdTokenChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ModuleViewer from './components/ModuleViewer';
import LandingPage from './components/LandingPage';
import VerifyEmail from './components/VerifyEmail';
import AccessibilityPanel from './components/AccessibilityPanel';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Loader2, LogOut, BookOpen, LayoutDashboard, GraduationCap, Trophy, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatAgent from './components/ChatAgent';
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Student',
            email: firebaseUser.email || '',
            role: 'student',
            learningStyle: 'none',
            points: 0,
            badges: []
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }

        // Redirect to dashboard if on auth or landing page
        if (location.pathname === '/auth' || location.pathname === '/') {
          if (firebaseUser.emailVerified) {
            navigate('/dashboard');
          } else {
            navigate('/verify-email');
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/auth');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    if (!user || !profile) return <Navigate to="/auth" />;

    if (!user.emailVerified) {
      return <Navigate to="/verify-email" />;
    }

    if (profile.role === 'student' && profile.learningStyle === 'none' && location.pathname !== '/quiz') {
      return <Navigate to="/quiz" />;
    }

    return (
      <div
        className={`min-h-screen flex flex-col transition-all duration-500 ${darkMode
            ? 'bg-[#071028] text-white'
            : 'bg-slate-50 text-slate-900'
          }`}
      >
        <nav
          className={`sticky top-0 z-50 border-b backdrop-blur-2xl transition-all duration-500 ${darkMode
              ? 'bg-[#071028]/80 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.45)]'
              : 'bg-white/80 border-slate-200'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg cursor-pointer" onClick={() => navigate('/')}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold hidden sm:block cursor-pointer" onClick={() => navigate('/')}>SALA</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-3 rounded-2xl transition-all duration-300 border ${darkMode
                      ? 'bg-white/5 border-white/10 text-yellow-300 hover:bg-white/10 shadow-lg shadow-indigo-500/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {profile.role === 'student' && profile.learningStyle !== 'none' && (
                  <div className="hidden md:flex items-center gap-6 mr-4">
                    <button
                      onClick={() => navigate('/')}
                      className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/quiz')}
                      className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/quiz' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Re-assess
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">{profile.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

          {darkMode && (
            <>
              <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            </>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  };

  return (
    <AccessibilityProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/quiz" element={<ProtectedLayout><Quiz onComplete={() => navigate('/dashboard')} /></ProtectedLayout>} />
        <Route path="/module/:id" element={
          <ProtectedLayout>
            <ModuleViewer
              moduleId={location.pathname.split('/').pop() || ''}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedLayout>
        } />
        <Route path="/dashboard" element={
          <ProtectedLayout>
            {profile?.role === 'teacher' ?
              <TeacherDashboard /> :
              <Dashboard onSelectModule={(module) => navigate(`/module/${module.module_id}`, { state: { module } })} />
            }
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AccessibilityPanel />
      <ChatAgent />
    </AccessibilityProvider>
  );
}
