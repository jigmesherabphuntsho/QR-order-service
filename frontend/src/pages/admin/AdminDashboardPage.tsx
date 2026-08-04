import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Clock, QrCode, ChefHat, Plus, TrendingUp, RefreshCw } from 'lucide-react';
import { DashboardStats, Order } from '../../types';
import { api } from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [resStats, resOrders] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders({ status: 'ALL' }),
      ]);
      if (resStats.success) setStats(resStats.stats);
      if (resOrders.success) setRecentOrders(resOrders.orders.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Manager Analytics & Overview
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time restaurant metrics and active table status.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="self-start sm:self-auto p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${stats?.todayRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Paid & confirmed sales</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Orders Today</span>
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.todayTotalOrders || 0}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Orders placed via QR scan</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Kitchen</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ChefHat className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {(stats?.pendingOrders || 0) + (stats?.preparingOrders || 0)}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold">
              {stats?.pendingOrders || 0} Pending • {stats?.preparingOrders || 0} Preparing
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Table Occupancy</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.occupiedTables || 0} / {stats?.totalTables || 12}
            </div>
            <p className="text-[11px] text-blue-600 font-semibold">Tables actively dining</p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-lg font-bold font-serif">Kitchen Display System (KDS) Active</h2>
            <p className="text-xs text-brand-100">
              Receive live audio chimes and manage kitchen orders in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/orders"
              className="py-3 px-5 rounded-2xl bg-white text-brand-700 font-extrabold text-xs shadow-md hover:bg-brand-50 transition-colors flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              <span>Open Live KDS Screen</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Recent Incoming Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Table</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">#{order.orderNumber}</td>
                    <td className="py-3 font-bold text-brand-500">Table #{order.tableNumber}</td>
                    <td className="py-3">{order.customerName || 'Guest'}</td>
                    <td className="py-3 font-extrabold">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20">
                        {order.status}
                      </span>
                    </td>

                    //Date and time display for the order creation time

                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>

                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
