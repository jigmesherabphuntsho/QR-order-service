import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Calendar,
  RefreshCw,
  Clock,
  ChevronRight,
  Flame,
  PieChart,
  BarChart3,
  Utensils,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsData } from '../../types';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  const fetchAnalytics = async (selectedPeriod = period, sDate = startDate, eDate = endDate) => {
    try {
      setIsLoading(true);
      const res = await api.getBusinessAnalytics({
        period: selectedPeriod,
        startDate: sDate || undefined,
        endDate: eDate || undefined,
      });
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period, startDate, endDate);
  }, [period]);

  const handleApplyCustomDate = () => {
    setPeriod('CUSTOM');
    fetchAnalytics('CUSTOM', startDate, endDate);
  };

  const periodOptions = [
    { key: 'THIS_WEEK', label: 'This Week' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { key: 'THIS_YEAR', label: 'This Year' },
  ];

  // Calculate maximum sales value for scaling bars
  const maxWeeklySales = analytics?.weeklySales
    ? Math.max(...analytics.weeklySales.map((d) => d.sales), 100)
    : 100;
  const maxMonthlySales = analytics?.monthlySales
    ? Math.max(...analytics.monthlySales.map((m) => m.sales), 100)
    : 100;
  const maxPeakOrders = analytics?.peakHours
    ? Math.max(...analytics.peakHours.map((h) => h.orderCount), 1)
    : 1;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Business Analytics & Sales Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 text-xs font-bold border border-brand-500/20">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time revenue tracking, trending items, and sales trend analysis.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(period, startDate, endDate)}
          className="self-start md:self-auto px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Period Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setPeriod(opt.key);
                setStartDate('');
                setEndDate('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                period === opt.key
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>Custom:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
          />
          <span className="text-xs text-slate-400">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
          />
          <button
            onClick={handleApplyCustomDate}
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Nu {analytics?.totalRevenue.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Valid confirmed orders</span>
          </p>
        </div>

        {/* Total Orders & Fulfillment */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Orders Completed</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.completedOrdersCount || 0} <span className="text-xs text-slate-400 font-normal">/ {analytics?.totalOrdersCount || 0}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-brand-600 font-semibold">
            {analytics?.fulfillmentRate.toFixed(1) || 0}% Fulfillment Rate
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Avg Order Value (AOV)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Nu {analytics?.averageOrderValue.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-purple-600 font-semibold">
            Average spend per order
          </p>
        </div>

        {/* Bestseller Dishes Count */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Top Trending Dish</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
            {analytics?.trendingItems[0]?.name || 'No Sales Yet'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-amber-600 font-semibold">
            {analytics?.trendingItems[0] ? `${analytics.trendingItems[0].totalQty} orders placed` : 'Awaiting orders'}
          </p>
        </div>
      </div>

      {/* Main Charts & Trending Food Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Revenue Bar Chart (Weekly / Monthly) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                <span>Sales Revenue Trend</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparative revenue breakdown over time.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartView === 'weekly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Past 7 Days
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartView === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                12 Months
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
              <span>Calculating chart data...</span>
            </div>
          ) : chartView === 'weekly' ? (
            <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
              {analytics?.weeklySales.map((day) => {
                const heightPercent = maxWeeklySales > 0 ? (day.sales / maxWeeklySales) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap mb-1">
                      Nu {day.sales.toFixed(2)} ({day.orderCount} orders)
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                        day.sales > 0
                          ? 'bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-brand-300 shadow-md shadow-brand-500/20'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-8 pb-2 px-1 border-b border-slate-100 dark:border-slate-800">
              {analytics?.monthlySales.map((m) => {
                const heightPercent = maxMonthlySales > 0 ? (m.sales / maxMonthlySales) * 100 : 0;
                return (
                  <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap mb-1">
                      Nu {m.sales.toFixed(2)} ({m.orderCount} orders)
                    </div>
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full max-w-[28px] rounded-t-xl transition-all duration-500 ${
                        m.sales > 0
                          ? 'bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[32px]">
                      {m.monthName.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Trending Food Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Trending Food Leaderboard</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Most popular dishes ranked by total quantity sold.
          </p>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading bestsellers...
            </div>
          ) : analytics?.trendingItems.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No order item data for this period.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {analytics?.trendingItems.map((item, index) => {
                const totalQtyMax = analytics.trendingItems[0]?.totalQty || 1;
                const percent = Math.round((item.totalQty / totalQtyMax) * 100);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                          index === 0 ? 'bg-amber-500 text-white shadow-sm' :
                          index === 1 ? 'bg-slate-300 text-slate-800' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          #{index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                            {item.totalQty} items ordered
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        Nu {item.totalSales.toFixed(2)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Peak Dining Hours Analysis Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Peak Dining Hours Analysis</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hourly order density graph to optimize kitchen staffing and table readiness.
            </p>
          </div>
        </div>

        {/* Hourly Distribution Grid */}
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading peak hours...
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-4">
            {analytics?.peakHours.map((h) => {
              const heightPercent = maxPeakOrders > 0 ? (h.orderCount / maxPeakOrders) * 100 : 0;
              const isPeak = h.orderCount > 0 && h.orderCount >= maxPeakOrders * 0.7;

              return (
                <div key={h.hour} className="flex flex-col items-center gap-1 group">
                  <div className="h-20 w-full flex items-end justify-center bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1 relative">
                    <div
                      style={{ height: `${Math.max(heightPercent, 6)}%` }}
                      className={`w-full rounded-lg transition-all ${
                        isPeak
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/30'
                          : h.orderCount > 0
                          ? 'bg-brand-500/80'
                          : 'bg-slate-200 dark:bg-slate-700/50'
                      }`}
                    />
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      {h.hour}: {h.orderCount} orders
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {h.hourNum}h
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
