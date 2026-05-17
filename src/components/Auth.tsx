import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserRole } from '../types';
import { GraduationCap, BookOpen, LogIn, AlertCircle, CheckCircle2, Mail, RefreshCw, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const getErrorMessage = (err: any) => {
    const code = err.code || '';
    const rawMessage = err.message || '';
    
    // Check both code and common message substrings for robustness
    if (code === 'auth/email-already-in-use' || rawMessage.includes('email-already-in-use')) {
      return 'This email is already registered. Please login instead.';
    }
    if (
      code === 'auth/invalid-credential' || 
      code === 'auth/invalid-login-credentials' ||
      rawMessage.includes('invalid-credential') ||
      rawMessage.includes('invalid-login-credentials')
    ) {
      return 'Invalid email or password. Please try again or sign up if you are new.';
    }
    if (code === 'auth/weak-password' || rawMessage.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/user-not-found' || rawMessage.includes('user-not-found')) {
      return 'No account found with this email. Please Sign Up.';
    }
    if (code === 'auth/wrong-password' || rawMessage.includes('wrong-password')) {
      return 'Incorrect password. Please try again.';
    }
    if (code === 'auth/invalid-email' || rawMessage.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'This sign-in method is not enabled. Please contact support.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Please try again later or reset your password.';
    }
    
    // Strip "Firebase: Error (auth/...)." prefix if present for cleaner UI
    return rawMessage.replace(/^Firebase: Error \(auth\/(.+)\)\.?/, '$1').replace(/-/g, ' ');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const trimmedEmail = email.trim();

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (!userCredential.user.emailVerified) {
          setError('Please verify your email before accessing the platform.');
          setLoading(false);
          return;
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name.trim(),
          email: trimmedEmail,
          role,
          learningStyle: 'none',
          points: 0,
          badges: []
        });

        setSuccess('Verification email sent! Please verify your email before logging in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      const msg = getErrorMessage(err);
      setError(msg);
      
      if (msg.includes('Switching you to Login')) {
        setTimeout(() => {
          setIsLogin(true);
          setError('');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccess('Verification email sent again. Please check your inbox.');
      setError('');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    setSuccess('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Default to student for Google sign in if new
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'student',
          learningStyle: 'none',
          points: 0,
          badges: []
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completion.');
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">SALA</h1>
          <p className="text-slate-500">Smart Adaptive Learning Assistant</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 rounded-lg border-2 transition-all ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 rounded-lg border-2 transition-all ${role === 'teacher' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-500'}`}
                  >
                    Teacher
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-2 items-start">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-red-600 text-sm">{error}</p>
                {error.includes('verify your email') && (
                  <button 
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-indigo-600 text-xs font-bold mt-2 hover:underline flex items-center gap-1"
                  >
                    {resending ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                    Resend Verification Email
                  </button>
                )}
                {error.includes('credentials') && isLogin && (
                  <button 
                    type="button"
                    onClick={handleResetPassword}
                    className="text-indigo-600 text-xs font-bold mt-1 hover:underline block"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex gap-2 items-start">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isLogin ? <><LogIn size={20} /> Login</> : <><BookOpen size={20} /> Sign Up</>}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
