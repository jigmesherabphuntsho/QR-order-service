import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import { Header } from './components/common/Header';
import { CartDrawer } from './components/customer/CartDrawer';

import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminQrPage } from './pages/admin/AdminQrPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import { Restaurant } from './types';
import { api } from './services/api';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    api.getRestaurant()
      .then((res) => {
        if (res.success) setRestaurant(res.restaurant);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <Header restaurant={restaurant} />

      <div className="flex-1">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerMenuPage />} />
          <Route path="/menu" element={<CustomerMenuPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/track" element={<TrackOrderPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrdersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedAdminRoute>
                <AdminMenuPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/qr"
            element={
              <ProtectedAdminRoute>
                <AdminQrPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettingsPage />
              </ProtectedAdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <CartDrawer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
