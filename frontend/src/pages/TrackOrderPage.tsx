import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Clock, QrCode, ArrowLeft, RefreshCw, Radio } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { OrderStatusStepper } from '../components/customer/OrderStatusStepper';
import toast from 'react-hot-toast';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected, joinOrderRoom } = useSocket();

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      const res = await api.getOrderById(orderId);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    if (!orderId) return;
    const interval = setInterval(() => {
      api.getOrderById(orderId)
        .then((res) => {
          if (res.success) setOrder(res.order);
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Socket Live Subscription
  useEffect(() => {
    if (orderId && socket) {
      joinOrderRoom(orderId);

      const handleStatusUpdate = (updatedOrder: Order) => {
        if (updatedOrder.id === orderId) {
          setOrder(updatedOrder);
          toast.success(`Order Status Updated: ${updatedOrder.status}`, {
            icon: '🔔',
          });
        }
      };

      socket.on('order_status_updated', handleStatusUpdate);

      return () => {
        socket.off('order_status_updated', handleStatusUpdate);
      };
    }
  }, [orderId, socket]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Connecting to live order tracker...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Order Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Please check your order tracking URL or scan the table QR code again.
        </p>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/menu?table=${order.tableNumber}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-xs font-bold">
          <Radio className="w-3.5 h-3.5 animate-ping text-emerald-500" />
          <span>{isConnected ? 'Live Socket Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main Status Tracker Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">

        {/* Table & Order Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="px-3 py-1 rounded-xl bg-brand-500 text-white font-extrabold text-xs">
              Table #{order.tableNumber}
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif mt-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: {order.customerName || 'Guest'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Placed At</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Stepper Component */}
        <OrderStatusStepper status={order.status} />

        {/* Items Summary list */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ordered Items
          </h3>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.menuItem?.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Nu {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total Amount</span>
            <span className="text-brand-500">Nu {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
