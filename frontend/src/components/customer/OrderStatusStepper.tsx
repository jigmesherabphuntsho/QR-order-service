import React from 'react';
import { Clock, ChefHat, CheckCircle2, Utensils, XCircle } from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Order Cancelled</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your order has been cancelled by the kitchen staff. Please contact server if needed.
        </p>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Received', desc: 'Sent to kitchen', icon: Clock },
    { key: 'PREPARING', label: 'Preparing', desc: 'Chef is cooking', icon: ChefHat },
    { key: 'READY', label: 'Ready to Serve', desc: 'Plated & warm', icon: CheckCircle2 },
    { key: 'SERVED', label: 'Served', desc: 'Enjoy your food!', icon: Utensils },
  ];

  const statusIndexMap: Record<OrderStatus, number> = {
    PENDING: 0,
    PREPARING: 1,
    READY: 2,
    SERVED: 3,
    CANCELLED: -1,
  };

  const currentIndex = statusIndexMap[status];

  return (
    <div className="w-full py-4 space-y-6">
      <div className="grid grid-cols-4 gap-2 relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
        <div
          className="absolute top-5 left-8 h-1 bg-brand-500 transition-all duration-700 -z-0"
          style={{ width: `${(currentIndex / 3) * 85}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 scale-110 shadow-lg shadow-brand-500/40 animate-pulse'
                    : isDone
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-3 text-xs font-bold ${
                  isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
