import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  QrCode,
  ChefHat,
  TrendingUp,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw
} from 'lucide-react';
import { DashboardStats, Order } from '../../types';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchDashboardData = async (
    page = currentPage,
    sDate = startDate,
    eDate = endDate
  ) => {
    try {
      setIsLoading(true);
      const [resStats, resOrders] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders({
          status: 'ALL',
          startDate: sDate || undefined,
          endDate: eDate || undefined,
          page: page,
          limit: pageSize,
        }),
      ]);
      if (resStats.success) setStats(resStats.stats);
      if (resOrders.success) {
        setRecentOrders(resOrders.orders);
        setTotalOrders(resOrders.total || resOrders.orders.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(currentPage, startDate, endDate);
  }, [currentPage]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchDashboardData(1, startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchDashboardData(1, '', '');
  };

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif">
            Manager Analytics & Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time restaurant metrics and active table status.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(currentPage, startDate, endDate)}
          className="self-start sm:self-auto p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Today's Revenue</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Nu {stats?.todayRevenue.toFixed(2) || ' 0.00'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Paid & confirmed sales</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-brand-500/10 text-brand-500">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.todayTotalOrders || 0}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Orders via QR scan</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Active Kitchen</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {(stats?.pendingOrders || 0) + (stats?.preparingOrders || 0)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-amber-600 font-semibold">
            {stats?.pendingOrders || 0} Pending • {stats?.preparingOrders || 0} Preparing
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Table Occupancy</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-500">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats?.occupiedTables || 0} / {stats?.totalTables || 12}
          </div>
          <p className="text-[10px] sm:text-[11px] text-blue-600 font-semibold">Tables actively dining</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-bold font-serif">Kitchen Display System (KDS) Active</h2>
          <p className="text-xs text-brand-100">
            Receive live audio chimes and manage kitchen orders in real time.
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="py-3 px-5 rounded-2xl bg-white text-brand-700 font-extrabold text-xs shadow-md hover:bg-brand-50 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <ChefHat className="w-4 h-4" />
          <span>Open Live KDS Screen</span>
        </Link>
      </div>

      {/* Recent Activity Container Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-serif">
              Recent Incoming Orders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track and filter transaction history by custom date range.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {/* Integrated & Blended Date Filter Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>Date Filter:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                aria-label="From Date"
              />
              <span className="text-xs text-slate-400 font-medium">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                aria-label="To Date"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyFilter}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>

              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilter}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-700 dark:text-slate-300 font-medium text-xs transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Info / Count Tag */}
          {(startDate || endDate) && (
            <div className="text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 rounded-xl border border-brand-200/80 dark:border-brand-800/50 self-start md:self-auto font-medium">
              Filter: <span className="font-bold">{startDate || 'Any'}</span> to <span className="font-bold">{endDate || 'Any'}</span> ({totalOrders} orders)
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
            <span>Loading orders...</span>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No orders found for the selected date range.
            </p>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="text-xs font-bold text-brand-500 hover:text-brand-600 underline"
              >
                Clear date filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Table</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">#{order.orderNumber}</td>
                      <td className="py-3 font-bold text-brand-500">Table #{order.tableNumber}</td>
                      <td className="py-3">{order.customerName || 'Guest'}</td>
                      <td className="py-3 font-extrabold">Nu {order.totalAmount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">#{order.orderNumber}</span>
                      <span className="font-bold text-xs text-brand-500">Table #{order.tableNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">{order.customerName || 'Guest'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">NU {order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(order.createdAt).toLocaleString([], {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Bar */}
            {totalOrders > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalOrders)} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages || isLoading}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
