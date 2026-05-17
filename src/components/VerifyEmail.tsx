import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const getErrorMessage = (err: any) => {
    const rawMessage = err.message || '';
    if (rawMessage.includes('invalid-credential') || rawMessage.includes('invalid-login-credentials')) {
      return 'Session expired or invalid credentials. Please sign in again.';
    }
    if (rawMessage.includes('network-request-failed')) {
      return 'Connection error. Please check your internet.';
    }
    return rawMessage.replace(/^Firebase: Error \(auth\/(.+)\)\.?/, '$1').replace(/-/g, ' ');
  };

  const handleRefresh = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        navigate('/dashboard');
      } else {
        setError('Email not verified yet. Please check your inbox and click the link.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await sendEmailVerification(user);
      setSuccess('Verification email sent again. Please check your inbox.');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full mb-6">
          <Mail size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          We've sent a verification link to <span className="font-semibold text-slate-900">{user.email}</span>. 
          Please verify your account before continuing.
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start text-left">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-100 p-4 rounded-2xl flex gap-3 items-start text-left">
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> I have verified</>}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full bg-white text-slate-700 border-2 border-slate-100 py-4 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            {resending ? <Loader2 className="animate-spin" /> : <><RefreshCw size={20} /> Resend Verification Email</>}
          </button>
        </div>

        <button
          onClick={() => auth.signOut()}
          className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
        >
          Sign out and use another account
          <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
}
