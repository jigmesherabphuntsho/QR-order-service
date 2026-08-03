import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Layers } from 'lucide-react';
import { TableInfo, Restaurant } from '../../types';
import { api } from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { QrCard } from '../../components/admin/QrCard';
import { DynamicQrGenerator } from '../../components/admin/DynamicQrGenerator';

export const AdminQrPage: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const [resTables, resRest] = await Promise.all([
        api.getTables(window.location.origin),
        api.getRestaurant(),
      ]);
      if (resTables.success) setTables(resTables.tables);
      if (resRest.success) setRestaurant(resRest.restaurant);
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = tables.filter((table) => {
    if (!filterQuery.trim()) return true;
    return table.number.toString().includes(filterQuery.trim());
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Table QR Code & Link Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Insert custom table numbers, auto-detect base URLs, generate dynamic QR codes, and export printable cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTables}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Tables</span>
            </button>
          </div>
        </div>

        {/* Interactive Dynamic QR Code Generator Form */}
        <DynamicQrGenerator
          restaurant={restaurant}
          onTableCreated={fetchTables}
        />

        {/* Managed Tables Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                All Active Restaurant Tables ({tables.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search table number..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              No tables found matching "{filterQuery}". Use the generator above to insert table numbers.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTables.map((table) => (
                <QrCard
                  key={table.id}
                  table={table}
                  restaurant={restaurant}
                  onDelete={fetchTables}
                  onUpdate={fetchTables}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
