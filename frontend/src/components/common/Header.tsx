import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sun, Moon, UtensilsCrossed, ShieldAlert, LayoutDashboard, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Restaurant } from '../../types';

interface HeaderProps {
  restaurant: Restaurant | null;
}

export const Header: React.FC<HeaderProps> = ({ restaurant }) => {
  const { totalItems, tableNumber, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 glass-panel transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white font-serif">
              {restaurant?.name || 'Gourmet Haven'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isAdminArea ? 'Management Portal' : restaurant?.tagline || 'Table QR Ordering'}
            </p>
          </div>
        </Link>

        {/* Center/Right Items */}
        <div className="flex items-center gap-3">
          
          {/* Table Indicator (Customer Mode) */}
          {!isAdminArea && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <QrCode className="w-3.5 h-3.5 text-brand-500" />
              <span>{tableNumber ? `Table #${tableNumber}` : 'No Table Set'}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Toggle / Link */}
          {isAuthenticated ? (
            <Link
              to={isAdminArea ? '/' : '/admin/dashboard'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium text-xs hover:opacity-90 transition-opacity"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{isAdminArea ? 'Customer View' : 'Admin Panel'}</span>
            </Link>
          ) : (
            !isAdminArea && (
              <Link
                to="/admin/login"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Admin Login"
              >
                <ShieldAlert className="w-5 h-5" />
              </Link>
            )
          )}

          {/* Customer Cart Button */}
          {!isAdminArea && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
