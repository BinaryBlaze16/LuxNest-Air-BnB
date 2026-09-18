import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, Send, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setVerificationPending(false);
    setErrorMsg('');
    setSuccessMsg('');
    closeAuthModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await signInWithEmail(email, password);
        handleClose();
      } else if (authModalMode === 'signup') {
        const result = await signUpWithEmail(email, password, fullName);
        // Supabase sends confirmation email if session is null or confirmation required
        if (result?.user && !result?.session) {
          setVerificationPending(true);
        } else {
          // If auto-confirm is active, close or notify
          setSuccessMsg('Account created successfully!');
          setTimeout(() => handleClose(), 1200);
        }
      } else if (authModalMode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Check your email for the password reset link!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-rose-400 flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                {verificationPending
                  ? 'Verify Your Email'
                  : authModalMode === 'login'
                  ? 'Welcome Back'
                  : authModalMode === 'signup'
                  ? 'Create Your Account'
                  : 'Reset Password'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Email Verification State Screen */}
            {verificationPending ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center shadow-glow animate-bounce">
                  <MailCheck className="w-8 h-8" />
                </div>
                
                <div>
                  <h4 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Check your inbox
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    We have sent a verification link to <span className="font-bold text-slate-900 dark:text-white">{email}</span>. Please click the confirmation link in the email to activate your LuxNest account.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Didn't receive the email?</p>
                  <p>Check your Spam/Junk folder or make sure your email address was entered correctly.</p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPending(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand to-rose-600 text-white font-bold text-xs shadow-glow hover:opacity-95 transition-all"
                  >
                    I've Confirmed, Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationPending(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-brand"
                  >
                    Back to edit email
                  </button>
                </div>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authModalMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Alexander Wright"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                      />
                    </div>
                  </div>

                  {authModalMode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        {authModalMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => openAuthModal('forgot')}
                            className="text-xs text-brand hover:underline font-medium"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand to-rose-600 hover:from-brand-dark hover:to-rose-700 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {authModalMode === 'login' && 'Sign In to LuxNest'}
                        {authModalMode === 'signup' && 'Create Account'}
                        {authModalMode === 'forgot' && 'Send Reset Link'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Toggle */}
                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  {authModalMode === 'login' && (
                    <p>
                      Don't have an account?{' '}
                      <button
                        onClick={() => openAuthModal('signup')}
                        className="text-brand font-semibold hover:underline ml-1"
                      >
                        Sign Up
                      </button>
                    </p>
                  )}
                  {authModalMode === 'signup' && (
                    <p>
                      Already have an account?{' '}
                      <button
                        onClick={() => openAuthModal('login')}
                        className="text-brand font-semibold hover:underline ml-1"
                      >
                        Sign In
                      </button>
                    </p>
                  )}
                  {authModalMode === 'forgot' && (
                    <p>
                      Remember your password?{' '}
                      <button
                        onClick={() => openAuthModal('login')}
                        className="text-brand font-semibold hover:underline ml-1"
                      >
                        Back to Sign In
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
