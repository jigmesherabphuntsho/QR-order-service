import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@restaurant.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        login(res.token, res.admin);
        toast.success(`Welcome back, ${res.admin.name}!`);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@restaurant.com');
    setPassword('admin123');
    toast.success('Demo admin credentials filled!');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
            Restaurant Admin Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to manage live orders, menu items, & table QR codes.
          </p>
        </div>

        {/* Demo Helper Pill */}
        <button
          onClick={fillDemoAdmin}
          className="w-full py-2 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Click to Auto-fill Demo Credentials</span>
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Want to register a new restaurant?{' '}
          <Link to="/admin/register" className="font-bold text-brand-500 hover:text-brand-600 underline">
            Register Your Restaurant
          </Link>
        </div>
      </div>
    </div>
  );
};
