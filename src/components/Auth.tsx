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
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  LogIn,
  BookOpen,
} from "lucide-react";
import { motion } from 'framer-motion';

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
  const [showPassword, setShowPassword] = useState(false);

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
  <div className="min-h-screen bg-[#050816] text-white overflow-hidden relative flex items-center justify-center">
    {/* BACKGROUND */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-violet-600/30 blur-3xl rounded-full" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 w-full max-w-md px-6"
    >
      <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_60px_rgba(99,102,241,0.25)]">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl mb-5">
            <GraduationCap size={38} />
          </div>

          <h1 className="text-4xl font-black mb-2">
            SALA
          </h1>

          <p className="text-slate-400">
            Smart Adaptive Learning Assistant
          </p>
        </div>

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black mb-3">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <p className="text-slate-400">
            {isLogin
              ? "Login to continue your AI learning journey."
              : "Join the future of AI-powered education."}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <>
              {/* NAME */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* ROLE */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-4 rounded-2xl font-semibold transition-all ${
                    role === "student"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white/5 border border-white/10 text-slate-300"
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`py-4 rounded-2xl font-semibold transition-all ${
                    role === "teacher"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white/5 border border-white/10 text-slate-300"
                  }`}
                >
                  Teacher
                </button>
              </div>
            </>
          )}

          {/* EMAIL */}
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-300 text-sm">
              {success}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Login
              </>
            ) : (
              <>
                <BookOpen size={20} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        {/* FORGOT PASSWORD */}
        {isLogin && (
          <button
            onClick={handleResetPassword}
            className="mt-5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Forgot Password?
          </button>
        )}

        {/* DIVIDER */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-[#050816] px-4 text-slate-500 text-sm">
              Continue with
            </span>
          </div>
        </div>

        {/* GOOGLE */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-semibold"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />

          Continue with Google
        </motion.button>

        {/* TOGGLE */}
        <p className="mt-8 text-center text-slate-400">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}{" "}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </motion.div>
  </div>
);
}