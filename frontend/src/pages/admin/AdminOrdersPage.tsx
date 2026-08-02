import React, { useEffect, useState } from 'react';
import { ChefHat, Radio, Filter, RefreshCw, Volume2 } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { KdsOrderCard } from '../../components/admin/KdsOrderCard';
import toast from 'react-hot-toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { socket, isConnected } = useSocket();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.getOrders({ status: selectedStatus });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  // Real-time Socket Listener for New Incoming Orders
  useEffect(() => {
    if (socket) {
      const handleNewOrder = (newOrder: Order) => {
        setOrders((prev) => [newOrder, ...prev]);

        // Play Web Audio Chime Alert
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5 note
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
          console.log('Audio chime auto-play prevented');
        }

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-brand-600 text-white shadow-2xl rounded-2xl p-4 flex items-center gap-3 border-2 border-white/20`}
            >
              <div className="p-2 rounded-xl bg-white text-brand-600 font-extrabold">
                Table #{newOrder.tableNumber}
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-sm">🔥 NEW ORDER RECEIVED!</div>
                <div className="text-xs opacity-90">Order #{newOrder.orderNumber} • ${newOrder.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      };

      const handleStatusUpdate = (updatedOrder: Order) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      };

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_updated', handleStatusUpdate);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_updated', handleStatusUpdate);
      };
    }
  }, [socket]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const statuses = ['ALL', 'PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                Live Kitchen Display System (KDS)
              </h1>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/30">
                <Radio className="w-3.5 h-3.5 animate-ping text-emerald-500" />
                <span>Live Socket</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time kitchen order feed with audio alerts and status updates.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <ChefHat className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No orders found for selected filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New orders submitted by customers will instantly pop up here with audio chime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <KdsOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
