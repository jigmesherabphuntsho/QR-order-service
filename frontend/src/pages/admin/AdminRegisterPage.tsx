import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, MapPin, DollarSign, ArrowRight, ShieldCheck, Sparkles, Building, Layers, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [restaurantName, setRestaurantName] = useState('');
  const [tagline, setTagline] = useState('Authentic Flavors & Fresh Ingredients');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('Nu ');
  const [tableCount, setTableCount] = useState(6);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password || !restaurantName) {
      const msg = 'Please fill in all required fields (Manager Name, Email, Password, Restaurant Name).';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter your password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.register({
        name,
        email,
        password,
        restaurantName,
        tagline,
        phone,
        address,
        currency,
        tableCount,
      });

      if (res.success) {
        toast.success(`🎉 ${res.restaurant.name} registered successfully!`);
        login(res.token, res.admin);
        navigate('/admin/dashboard');
      } else {
        const msg = res.message || 'Registration failed.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('Registration Catch Error:', err);
      const msg = err.message || 'Server error occurred during registration. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 flex items-center justify-center p-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

        {/* Left Branding Sidebar */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-600 to-brand-700 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white text-brand-600 shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold font-serif">Smart QR SaaS</h1>
                <p className="text-xs text-brand-100">Multi-Restaurant Platform</p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <h2 className="text-2xl font-bold font-serif leading-tight">
                Register Your Restaurant Platform Today
              </h2>
              <p className="text-xs text-brand-100 leading-relaxed opacity-90">
                Setup your personalized digital QR menu, live kitchen screen, table management, and sales analytics in under 2 minutes.
              </p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="space-y-2.5 text-xs text-brand-100 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Isolated menu & order management</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Instant QR codes generated for tables</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Real-time kitchen order chimes & KDS</span>
            </div>
          </div>

          <div className="text-[11px] text-brand-200 pt-4 border-t border-brand-500/30">
            © 2026 Smart QR SaaS • Multi-Tenant Enterprise
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
              Manager & Restaurant Registration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your details to create your admin account and launch your restaurant.
            </p>
          </div>

          {/* Error Alert Pop-up */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 text-xs shadow-lg flex items-start justify-between gap-3 animate-shake">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-red-700 dark:text-red-300">Registration Failed</h4>
                  <p className="mt-0.5 font-medium leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Manager Details Section */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>1. Manager Credentials</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Manager Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Manager Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="admin@restaurant.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Profile Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>2. Restaurant Business Profile</span>
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Gourmet Haven / Bhutanese Flavors"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Authentic Flavors & Fresh Ingredients"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="+975 17 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Main Street, Thimphu, Bhutan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Symbol
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Nu "
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Tables
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCount}
                    onChange={(e) => setTableCount(parseInt(e.target.value) || 6)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Registering Restaurant...</span>
              ) : (
                <>
                  <span>Create Admin & Launch Restaurant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Already registered your restaurant?{' '}
            <Link to="/admin/login" className="font-bold text-brand-500 hover:text-brand-600 underline">
              Sign In to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
