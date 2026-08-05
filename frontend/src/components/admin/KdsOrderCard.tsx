import React from 'react';
import { Clock, QrCode, User, FileText, CheckCircle, ArrowRight, Ban, ChefHat } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface KdsOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const KdsOrderCard: React.FC<KdsOrderCardProps> = ({ order, onUpdateStatus }) => {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse';
      case 'PREPARING':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'READY':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'SERVED':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
    }
  };

  const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-brand-500 text-white font-extrabold text-sm shadow-sm">
            Table #{order.tableNumber}
          </span>
          <span className="font-bold text-xs text-slate-500 dark:text-slate-400">
            #{order.orderNumber}
          </span>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Body Info */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <User className="w-3.5 h-3.5 text-brand-500" />
            <span>{order.customerName || 'Guest'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center shrink-0">
                  {item.quantity}x
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.menuItem?.name || 'Dish Item'}
                  </span>
                  {item.notes && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                      Note: "{item.notes}"
                    </p>
                  )}
                </div>
              </div>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Nu {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span><strong>Kitchen Note:</strong> "{order.notes}"</span>
          </div>
        )}
      </div>

      {/* Footer & Action Buttons */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">Total Price:</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">Nu {order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2">
          {order.status === 'PENDING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
              className="col-span-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>Start Preparing</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'READY')}
              className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Ready to Serve</span>
            </button>
          )}

          {order.status === 'READY' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'SERVED')}
              className="col-span-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Mark Served</span>
            </button>
          )}

          {order.status !== 'SERVED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
              className="col-span-2 py-1.5 px-3 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
