import React, { useEffect, useState } from 'react';
import { QrCode, RefreshCw, Plus, Globe, Sparkles, Search, Trash2, CheckCircle, Link } from 'lucide-react';
import { TableInfo, Restaurant } from '../../types';
import { api } from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { QrCard } from '../../components/admin/QrCard';
import toast from 'react-hot-toast';

export const AdminQrPage: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic Base URL State
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    return localStorage.getItem('qr_custom_base_url') || window.location.origin;
  });

  // Table Management State
  const [newTableNum, setNewTableNum] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Quick Instant Generator State
  const [quickTableNum, setQuickTableNum] = useState<string>('');
  const [quickQrResult, setQuickQrResult] = useState<{
    tableNumber: number;
    url: string;
    qrDataUrl: string;
  } | null>(null);
  const [isQuickGenerating, setIsQuickGenerating] = useState<boolean>(false);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const [resTables, resRest] = await Promise.all([
        api.getTables(baseUrl),
        api.getRestaurant(),
      ]);
      if (resTables.success) setTables(resTables.tables);
      if (resRest.success) setRestaurant(resRest.restaurant);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch tables');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [baseUrl]);

  const handleBaseUrlChange = (val: string) => {
    setBaseUrl(val);
    localStorage.setItem('qr_custom_base_url', val);
  };

  const handleResetBaseUrl = () => {
    const origin = window.location.origin;
    setBaseUrl(origin);
    localStorage.removeItem('qr_custom_base_url');
    toast.success(`Reset host domain to ${origin}`);
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid table number greater than 0');
      return;
    }

    try {
      setIsCreating(true);
      const res = await api.createTable(num);
      if (res.success) {
        toast.success(res.message || `Table #${num} added!`);
        setNewTableNum('');
        fetchTables();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create table');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async (id: string, number: number) => {
    if (!window.confirm(`Are you sure you want to delete Table #${number}?`)) return;

    try {
      const res = await api.deleteTable(id);
      if (res.success) {
        toast.success(`Table #${number} deleted`);
        setTables((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete table');
    }
  };

  const handleQuickGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(quickTableNum, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }

    try {
      setIsQuickGenerating(true);
      const res = await api.generateTableQR(num, baseUrl);
      if (res.success) {
        setQuickQrResult({
          tableNumber: res.tableNumber,
          url: res.url,
          qrDataUrl: res.qrDataUrl,
        });
        toast.success(`Generated instant QR code for Table #${num}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate QR code');
    } finally {
      setIsQuickGenerating(false);
    }
  };

  const filteredTables = tables.filter((t) => {
    if (!searchFilter.trim()) return true;
    return t.number.toString().includes(searchFilter.trim());
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Dynamic Table QR Code Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, preview, and export dynamic QR codes that link directly to customer table menus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTables}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Tables</span>
            </button>
          </div>
        </div>

        {/* Dynamic Base URL & Domain Config Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
              <Globe className="w-4 h-4 text-brand-500" />
              <span>Dynamic Host Domain / Base URL</span>
            </div>
            <button
              type="button"
              onClick={handleResetBaseUrl}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Auto-Detect Current Browser Host</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            QR codes generate links using this base host (e.g. <code className="font-mono text-brand-600 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{baseUrl}/menu?table=N</code>). Updates apply in real time!
          </p>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="e.g. http://192.168.1.50:5173 or https://your-domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Panel: Add Table & Quick Instant Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Table Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Plus className="w-4 h-4 text-brand-500" />
                <span>Add New Table to Database</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Total: {tables.length} Tables</span>
            </div>

            <form onSubmit={handleCreateTable} className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="Table Number (e.g. 15)"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCreating || !newTableNum.trim()}
                className="px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
              >
                {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Table</span>
              </button>
            </form>
          </div>

          {/* Instant On-The-Fly Quick Generator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant Quick QR Generator</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">On-the-fly</span>
            </div>

            <form onSubmit={handleQuickGenerate} className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="Insert Table # (e.g. 99)"
                value={quickTableNum}
                onChange={(e) => setQuickTableNum(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isQuickGenerating || !quickTableNum.trim()}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
              >
                {isQuickGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>Generate</span>
              </button>
            </form>
          </div>
        </div>

        {/* Instant Quick Generator Modal/Card Preview if generated */}
        {quickQrResult && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Instant Dynamic QR Preview for Table #{quickQrResult.tableNumber}</span>
              </div>
              <button
                onClick={() => setQuickQrResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Dismiss
              </button>
            </div>

            <div className="max-w-xs mx-auto">
              <QrCard
                table={{
                  id: `quick-${quickQrResult.tableNumber}`,
                  number: quickQrResult.tableNumber,
                  qrUrl: quickQrResult.url,
                  qrDataUrl: quickQrResult.qrDataUrl,
                  isOccupied: false,
                }}
                restaurant={restaurant}
              />
            </div>
          </div>
        )}

        {/* Filter / Search Bar for Tables */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search table number..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No tables found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchFilter ? 'Try searching for a different table number.' : 'Add your first table using the form above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table) => (
              <QrCard
                key={table.id}
                table={table}
                restaurant={restaurant}
                onDelete={handleDeleteTable}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

