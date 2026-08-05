import React, { useState } from 'react';
import { X, Plus, Minus, MessageSquare, Sparkles, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  currency?: string;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, currency = 'Nu ' }) => {
  if (!item) return null;

  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!item.isAvailable) return;
    addToCart(item, quantity, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {item.isTodaySpecial && (
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Chef's Special Recommendation
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                {item.name}
              </h2>
              <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                {currency}{item.price.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Special Instructions Note */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <span>Special Instructions (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Less spicy, dressing on the side, extra crispy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-between transition-all ${isAdded
                ? 'bg-emerald-600 text-white'
                : item.isAvailable
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 active:scale-[0.99]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
          >
            {isAdded ? (
              <span className="w-full flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Added to Order!
              </span>
            ) : (
              <>
                <span>Add to Cart ({quantity})</span>
                <span className="font-extrabold text-base">
                  {currency}{(item.price * quantity).toFixed(2)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
