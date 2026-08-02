import React, { useEffect, useState } from 'react';
import { QrCode, Download, RefreshCw, Printer } from 'lucide-react';
import { TableInfo, Restaurant } from '../../types';
import { api } from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { QrCard } from '../../components/admin/QrCard';

export const AdminQrPage: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const [resTables, resRest] = await Promise.all([
        api.getTables(),
        api.getRestaurant(),
      ]);
      if (resTables.success) setTables(resTables.tables);
      if (resRest.success) setRestaurant(resRest.restaurant);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
              Table QR Code Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate, preview, and export print-ready QR code cards for every table.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTables}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Tables</span>
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <QrCard
                key={table.id}
                table={table}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
