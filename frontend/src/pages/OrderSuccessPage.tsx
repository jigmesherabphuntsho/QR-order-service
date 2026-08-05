import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, QrCode, ArrowRight, Utensils, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      api.getOrderById(orderId)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Confirming your order with kitchen...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/20 animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            Table #{order?.tableNumber || 1}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif mt-2">
            Order Sent to Kitchen!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Order #{order?.orderNumber || '1001'} • Received at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* ETA Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Estimated Preparation Time
              </div>
              <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                15 - 25 Minutes
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="text-left space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Order Summary
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.quantity}x {item.menuItem?.name || 'Item'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Nu {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total Amount Paid</span>
            <span className="text-brand-500">Nu {order?.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          {orderId && (
            <Link
              to={`/track?orderId=${orderId}`}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            to={`/menu?table=${order?.tableNumber || 1}`}
            className="w-full py-3 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Utensils className="w-4 h-4" />
            <span>Order More Items</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
